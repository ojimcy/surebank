const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Notification, NotificationPreference } = require('../models');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const logger = require('../config/logger');
const notificationPreferenceSchema = require('../models/notificationPreference.schema');

const createNotification = async (input) => {
  const NotificationModel = await Notification();
  const notification = await NotificationModel.create(input);
  return notification;
};

const getNotifications = async (userId, filter, options) => {
  const NotificationModel = await Notification();
  const notifications = await NotificationModel.paginate({ userId, ...filter }, options);
  return notifications;
};

const getUnreadNotificationsCount = async (userId) => {
  const NotificationModel = await Notification();
  const count = await NotificationModel.countDocuments({ userId, isRead: false });
  return count;
};

const markNotificationAsRead = async (userId, notificationId) => {
  const NotificationModel = await Notification();
  const notification = await NotificationModel.findById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (!notification.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  notification.isRead = true;
  await notification.save();
  return notification;
};

/**
 * Get user notification preferences
 * @param {ObjectId} userId
 * @returns {Promise<NotificationPreference>}
 */
const getUserPreferences = async (userId) => {
  const NotificationPreferenceModel = await NotificationPreference();

  try {
    // Use findOneAndUpdate with upsert to handle concurrent attempts to create preferences
    // This is an atomic operation that will create preferences if they don't exist,
    // or return existing preferences if they do
    const preferences = await NotificationPreferenceModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } }, // Only set userId if creating a new document
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return the updated/created document
        runValidators: true, // Ensure validation runs on new document
      }
    );

    return preferences;
  } catch (error) {
    // If we still get a duplicate key error, it means another operation created the document
    // between our find and update. In this case, just retrieve the document.
    if (error.code === 11000) {
      logger.info(`Concurrent notification preference creation detected for user ${userId}, fetching existing preferences`);
      return NotificationPreferenceModel.findOne({ userId });
    }

    // For any other error, rethrow it
    throw error;
  }
};

/**
 * Update user notification preferences
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<NotificationPreference>}
 */
const updateUserPreferences = async (userId, updateBody) => {
  const NotificationPreferenceModel = await NotificationPreference();
  const preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification preferences not found');
  }

  // Validate notification types
  Object.keys(updateBody.preferences || {}).forEach((type) => {
    if (!notificationPreferenceSchema.statics.NOTIFICATION_TYPES.includes(type)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid notification type: ${type}`);
    }
  });

  Object.assign(preferences, updateBody);
  await preferences.save();
  return preferences;
};

/**
 * Send notification based on user preferences
 * @param {ObjectId} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} data - Notification data (subject, message, email, etc)
 * @returns {Promise<void>}
 */
const sendNotification = async (userId, type, data) => {
  try {
    const preferences = await getUserPreferences(userId);

    // Check if user has unsubscribed from all notifications
    if (preferences.unsubscribedFromAll) {
      logger.info(`User ${userId} has unsubscribed from all notifications`);
      return;
    }

    // Get channel preference for this notification type
    const channel = preferences.preferences[type];
    if (!channel || channel === 'none') {
      logger.info(`Notifications of type ${type} are disabled for user ${userId}`);
      return;
    }

    const { subject, message, templateData, reference, relatedEntityId, relatedEntityType, template, smsTemplate } = data;

    // Validate required fields based on channel
    if ((channel === 'email' || channel === 'both') && !data.email) {
      logger.warn(`Email notification requested but no email address provided for user ${userId}`);
      return;
    }

    if ((channel === 'sms' || channel === 'both') && !data.phoneNumber) {
      logger.warn(`SMS notification requested but no phone number provided for user ${userId}`);
      return;
    }
    // Save the notification in the database
    try {
      await createNotification({
        userId,
        title: subject,
        body: message,
        type: notificationPreferenceSchema.statics.NOTIFICATION_TYPES.indexOf(type),
        reference,
        relatedEntityId,
        relatedEntityType,
      });
    } catch (error) {
      logger.error('Error saving notification to database:', {
        message: error.message,
        userId,
        type,
      });
      // Continue with sending, even if saving to DB fails
    }

    try {
      switch (channel) {
        case 'email':
          if (data.email) {
            await emailService.sendEmail({
              to: data.email,
              subject: subject || 'Notification',
              template,
              data: templateData || {},
            });
          }
          break;

        case 'sms':
          if (data.phoneNumber) {
            if (smsTemplate) {
              await smsService.sendNotificationSMS(data.phoneNumber, smsTemplate, templateData || {});
            } else if (message) {
              await smsService.sendSMS({
                to: data.phoneNumber,
                message,
              });
            }
          }
          break;

        case 'both': {
          const promises = [];
          if (data.email) {
            promises.push(
              emailService.sendEmail({
                to: data.email,
                subject: subject || 'Notification',
                template,
                data: templateData || {},
              })
            );
          }

          if (data.phoneNumber) {
            if (smsTemplate) {
              promises.push(smsService.sendNotificationSMS(data.phoneNumber, smsTemplate, templateData || {}));
            } else if (message) {
              promises.push(
                smsService.sendSMS({
                  to: data.phoneNumber,
                  message,
                })
              );
            }
          }

          if (promises.length > 0) {
            await Promise.allSettled(promises);
          }
          break;
        }

        default:
          logger.info(`No notifications sent for channel: ${channel}`);
      }

      logger.info(`Successfully sent ${type} notification to user ${userId} via ${channel}`);
    } catch (error) {
      // Log error but don't throw to prevent blocking the main process
      logger.error('Error sending notification through channel:', {
        channel,
        error: error.message,
        userId,
        type,
      });
    }
  } catch (error) {
    logger.error('Error in notification process:', {
      message: error.message,
      userId,
      type,
    });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send notification');
  }
};

/**
 * Unsubscribe user from all notifications
 * @param {ObjectId} userId
 * @returns {Promise<NotificationPreference>}
 */
const unsubscribeFromAll = async (userId) => {
  const NotificationPreferenceModel = await NotificationPreference();
  const preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification preferences not found');
  }

  preferences.unsubscribedFromAll = true;
  await preferences.save();
  return preferences;
};

/** unsubscribe from a specific notification type */
const unsubscribeFromNotificationType = async (userId, type) => {
  const NotificationPreferenceModel = await NotificationPreference();
  const preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification preferences not found');
  }
  preferences.preferences[type] = 'none';
  await preferences.save();
  return preferences;
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  getUserPreferences,
  updateUserPreferences,
  sendNotification,
  unsubscribeFromAll,
  unsubscribeFromNotificationType,
  NOTIFICATION_TYPES: notificationPreferenceSchema.statics.NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS: notificationPreferenceSchema.statics.NOTIFICATION_CHANNELS,
};
