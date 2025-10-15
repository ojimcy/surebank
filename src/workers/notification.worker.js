const notificationService = require('../services/notification.service');
const logger = require('../config/logger');

/**
 * Notification Queue Worker
 * Processes multi-channel notification jobs from the queue
 */

const QUEUE_NAME = 'notification-queue';
const JOB_TYPES = {
  SEND_NOTIFICATION: 'send-notification',
  SEND_MULTI_CHANNEL: 'send-multi-channel',
  SEND_TEMPLATED: 'send-templated',
  SEND_BULK: 'send-bulk-notifications',
};

/**
 * Process notification job
 */
const processNotificationJob = async (job) => {
  const { name, data } = job;

  logger.info(`Processing notification job ${job.id} of type ${name}`);

  try {
    let result;

    switch (name) {
      case JOB_TYPES.SEND_NOTIFICATION:
        result = await processInAppNotification(data);
        break;

      case JOB_TYPES.SEND_MULTI_CHANNEL:
        result = await processMultiChannelNotification(data);
        break;

      case JOB_TYPES.SEND_TEMPLATED:
        result = await processTemplatedNotification(data);
        break;

      case JOB_TYPES.SEND_BULK:
        result = await processBulkNotifications(data);
        break;

      default:
        // Default to multi-channel notification
        result = await processMultiChannelNotification(data);
    }

    logger.info(`Notification job ${job.id} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`Notification job ${job.id} failed:`, error);
    throw error;
  }
};

/**
 * Process in-app notification
 */
const processInAppNotification = async ({ userId, type, notificationData }) => {
  try {
    if (!userId || !type || !notificationData) {
      throw new Error('Missing required fields: userId, type, and notificationData');
    }

    const result = await notificationService.sendNotification(userId, type, notificationData);

    logger.info(`In-app notification sent to user ${userId} for type ${type}`);
    return {
      success: true,
      userId,
      type,
      notificationId: result?._id,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send in-app notification to user ${userId}:`, error);
    throw error;
  }
};

/**
 * Process multi-channel notification
 */
const processMultiChannelNotification = async (data) => {
  try {
    const { userId, type, user, notificationContent, notificationData } = data;

    if (!userId || !type) {
      throw new Error('Missing required fields: userId and type');
    }

    const result = await notificationService.sendMultiChannelNotification({
      userId,
      type,
      user,
      data: notificationData,
      notificationContent,
      notificationData,
    });

    logger.info(`Multi-channel notification sent to user ${userId} for type ${type}. Results:`, result);
    return {
      success: true,
      userId,
      type,
      channels: result,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send multi-channel notification:`, error);
    throw error;
  }
};

/**
 * Process templated notification
 */
const processTemplatedNotification = async (data) => {
  try {
    const { userId, templateType, templateData, user, metadata } = data;

    if (!userId || !templateType) {
      throw new Error('Missing required fields: userId and templateType');
    }

    const result = await notificationService.sendTemplatedNotification({
      userId,
      templateType,
      data: templateData,
      user,
      metadata,
    });

    logger.info(`Templated notification sent to user ${userId} using template ${templateType}. Results:`, result);
    return {
      success: true,
      userId,
      templateType,
      channels: result,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send templated notification:`, error);
    throw error;
  }
};

/**
 * Process bulk notifications
 */
const processBulkNotifications = async ({ notifications, options = {} }) => {
  const results = {
    total: notifications.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const { batchSize = 20, delayBetweenBatches = 100 } = options;

  logger.info(`Starting bulk notification send for ${notifications.length} notifications`);

  // Process in batches
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    const batchPromises = batch.map(async (notification, index) => {
      try {
        let result;

        // Determine notification type
        if (notification.templateType) {
          result = await processTemplatedNotification(notification);
        } else if (notification.notificationContent) {
          result = await processMultiChannelNotification(notification);
        } else {
          result = await processInAppNotification(notification);
        }

        results.sent++;
        logger.debug(`Bulk notification sent to user ${notification.userId} (${results.sent}/${notifications.length})`);
        return result;

      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: notification.userId,
          type: notification.type || notification.templateType,
          error: error.message,
          index: i + index,
        });
        logger.error(`Bulk notification failed for user ${notification.userId}:`, error.message);
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches
    if (i + batchSize < notifications.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }

    logger.info(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(notifications.length / batchSize)}`);
  }

  logger.info(`Bulk notification send completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Initialize worker
 */
const initialize = (queueService) => {
  // Register worker with the queue
  queueService.createWorker(QUEUE_NAME, processNotificationJob, {
    concurrency: 15, // Process up to 15 notifications concurrently
  });

  logger.info(`Notification worker initialized for queue: ${QUEUE_NAME}`);
};

module.exports = {
  QUEUE_NAME,
  JOB_TYPES,
  processNotificationJob,
  initialize,
};