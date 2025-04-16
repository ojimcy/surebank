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

  const preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    // Create default preferences if none exist
    return NotificationPreferenceModel.create({ userId });
  }
  return preferences;
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
 * @param {ObjectId} userId
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
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

    const { subject, message, templateData, reference, relatedEntityId, relatedEntityType } = data;

    // Save the notification in the database
    await createNotification({
      userId,
      title: subject,
      body: message,
      type: notificationPreferenceSchema.statics.NOTIFICATION_TYPES.indexOf(type),
      reference,
      relatedEntityId,
      relatedEntityType,
    });

    switch (channel) {
      case 'email':
        await emailService.sendEmail({
          to: data.email,
          subject,
          template: data.template,
          data: templateData,
        });
        break;

      case 'sms':
        await smsService.sendSMS({
          to: data.phoneNumber,
          message,
        });
        break;

      case 'both':
        await Promise.all([
          emailService.sendEmail({
            to: data.email,
            subject,
            template: data.template,
            data: templateData,
          }),
          smsService.sendSMS({
            to: data.phoneNumber,
            message,
          }),
        ]);
        break;

      default:
        logger.info(`No notifications sent for channel: ${channel}`);
    }

    logger.info(`Successfully sent ${type} notification to user ${userId} via ${channel}`);
  } catch (error) {
    logger.error('Error sending notification:', error);
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
