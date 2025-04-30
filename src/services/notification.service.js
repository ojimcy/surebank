const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Notification, NotificationPreference } = require('../models');
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
 * Send in-app notification (no email or SMS)
 * @param {ObjectId} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @param {string} data.title - Notification title
 * @param {string} data.body - Notification body
 * @param {string} [data.reference] - Optional reference
 * @param {ObjectId} [data.relatedEntityId] - Optional related entity ID
 * @param {string} [data.relatedEntityType] - Optional related entity type
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

    // Extract notification data
    const { title, body, reference, relatedEntityId, relatedEntityType } = data;

    // Save the notification in the database
    try {
      const notification = await createNotification({
        userId,
        title: title || 'Notification',
        body: body || '',
        type: notificationPreferenceSchema.statics.NOTIFICATION_TYPES.indexOf(type),
        reference,
        relatedEntityId,
        relatedEntityType,
      });

      logger.info(`Successfully created in-app notification for user ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Error saving notification to database:', {
        message: error.message,
        userId,
        type,
      });
      throw error;
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
 * Check user notification preference for a specific type
 * @param {ObjectId} userId - User ID
 * @param {string} type - Notification type
 * @returns {Promise<string|null>} The preferred channel or null if disabled
 */
const getUserNotificationPreference = async (userId, type) => {
  try {
    const preferences = await getUserPreferences(userId);

    // If user has unsubscribed from all, return null
    if (preferences.unsubscribedFromAll) {
      return null;
    }

    // Get channel preference for this notification type
    const channel = preferences.preferences[type];
    return !channel || channel === 'none' ? null : channel;
  } catch (error) {
    logger.error('Error getting user notification preference:', error);
    return null;
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
  getUserNotificationPreference,
};
