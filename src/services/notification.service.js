const httpStatus = require('http-status');
const Notification = require('../models/notification.model');
const ApiError = require('../utils/ApiError');
const { NotificationPreference } = require('../models');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const logger = require('../config/logger');

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
  const preferences = await NotificationPreference.findOne({ userId });
  if (!preferences) {
    // Create default preferences if none exist
    return NotificationPreference.create({ userId });
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
  const preferences = await NotificationPreference.findOne({ userId });
  if (!preferences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification preferences not found');
  }

  // Validate notification types
  Object.keys(updateBody.preferences || {}).forEach((type) => {
    if (!NotificationPreference.NOTIFICATION_TYPES.includes(type)) {
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

    // Get specific preference for this notification type
    const preference = preferences.preferences[type];
    if (!preference || !preference.enabled) {
      logger.info(`Notifications of type ${type} are disabled for user ${userId}`);
      return;
    }

    const { channel } = preference;
    const { subject, message, templateData } = data;

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
  const preferences = await NotificationPreference.findOne({ userId });
  if (!preferences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification preferences not found');
  }

  preferences.unsubscribedFromAll = true;
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
  NOTIFICATION_TYPES: NotificationPreference.NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS: NotificationPreference.NOTIFICATION_CHANNELS,
};
