const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Notification, NotificationPreference, User } = require('../models');
const logger = require('../config/logger');
const notificationPreferenceSchema = require('../models/notificationPreference.schema');
const { sendEmail, sendGenericPackageCreationEmail, sendGenericContributionEmail } = require('./email.service');
const { sendSms } = require('./sms.service');

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
  logger.info(`Marking notification as read: ${notificationId} for user: ${userId}`);
  const NotificationModel = await Notification();
  const notification = await NotificationModel.findById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  logger.info(`Notification: ${notification}`);
  if (String(notification.userId) !== String(userId)) {
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

  // Create a shallow copy of updateBody to avoid modifying the function parameter
  const updateData = { ...updateBody };

  // Validate notification types and update preferences Map
  if (updateData.preferences) {
    Object.entries(updateData.preferences).forEach(([type, channel]) => {
      if (!notificationPreferenceSchema.statics.NOTIFICATION_TYPES.includes(type)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid notification type: ${type}`);
      }
      preferences.preferences.set(type, channel);
    });

    // Remove preferences property to prevent overwriting the entire Map
    delete updateData.preferences;
  }

  // Update other properties
  Object.assign(preferences, updateData);
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
    const channel = preferences.preferences.get(type);
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

    // Get channel preference for this notification type from the Map
    const channel = preferences.preferences.get(type);
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
  preferences.preferences.set(type, 'none');
  await preferences.save();
  return preferences;
};

/**
 * Send notification through multiple channels (in-app, email, SMS) based on user preferences
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID
 * @param {string} params.type - Notification type (e.g., 'package_created', 'account_activity')
 * @param {Object} params.user - User object with contact information (optional, will be fetched if not provided)
 * @param {Object} params.data - Data specific to the notification
 * @param {Object} params.notificationContent - Content for different channels
 * @param {Object} params.notificationContent.inApp - In-app notification content
 * @param {string} params.notificationContent.inApp.title - In-app notification title
 * @param {string} params.notificationContent.inApp.body - In-app notification body
 * @param {Object} [params.notificationContent.email] - Email notification content
 * @param {string} [params.notificationContent.email.subject] - Email subject
 * @param {string|Object} [params.notificationContent.email.template] - Email template name or object
 * @param {Object} [params.notificationContent.email.templateData] - Data for email template
 * @param {string} [params.notificationContent.sms] - SMS message content
 * @param {Object} [params.notificationData] - Additional notification metadata
 * @returns {Promise<Object>} Result with status of each channel
 */
const sendMultiChannelNotification = async ({ userId, type, user, data, notificationContent, notificationData = {} }) => {
  if (!userId) {
    logger.error('sendMultiChannelNotification called without userId');
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  if (!type) {
    logger.error('sendMultiChannelNotification called without notification type');
    throw new ApiError(httpStatus.BAD_REQUEST, 'Notification type is required');
  }

  if (!notificationContent) {
    logger.error('sendMultiChannelNotification called without notification content');
    throw new ApiError(httpStatus.BAD_REQUEST, 'Notification content is required');
  }

  const result = {
    inApp: false,
    email: false,
    sms: false,
  };

  try {
    // Fetch user if not provided
    let userToUse = user;
    if (!userToUse) {
      // Use dynamic import to avoid circular dependencies
      const UserModel = await User();
      userToUse = await UserModel.findById(userId);
      if (!userToUse) {
        logger.warn(`Could not send notification: User ${userId} not found`);
        return result;
      }
    }

    // Send in-app notification
    if (notificationContent.inApp) {
      try {
        const { title, body } = notificationContent.inApp;
        const inAppData = {
          title,
          body,
          ...notificationData,
        };

        await sendNotification(userId, type, inAppData);
        result.inApp = true;
        logger.info(`In-app notification sent to user ${userId} for type ${type}`);
      } catch (error) {
        logger.error(`Error sending in-app notification to user ${userId}:`, error);
      }
    }

    // Send email notification if enabled for this type
    if (notificationContent.email && userToUse.email) {
      try {
        const emailPreference = await getUserNotificationPreference(userId, type);
        if (emailPreference === 'email' || emailPreference === 'both') {
          const { subject, template, templateData, html } = notificationContent.email;

          // Support both template-based and direct HTML emails
          if (html) {
            await sendEmail({
              to: userToUse.email,
              subject,
              html,
            });
          } else if (template === 'PACKAGE_CREATION') {
            // Special case for package creation emails
            await sendGenericPackageCreationEmail(userToUse.email, templateData);
          } else if (template === 'CONTRIBUTION') {
            await sendGenericContributionEmail(userToUse.email, templateData);
          } else {
            await sendEmail({
              to: userToUse.email,
              subject,
              template,
              templateData,
            });
          }

          result.email = true;
          logger.info(`Email notification sent to ${userToUse.email} for type ${type}`);
        }
      } catch (error) {
        logger.error(`Error sending email notification to ${userToUse.email}:`, error);
      }
    }

    // Send SMS notification if enabled for this type
    const phoneNumber = userToUse.phoneNumber || (data && data.phoneNumber);
    if (notificationContent.sms && phoneNumber) {
      try {
        const smsPreference = await getUserNotificationPreference(userId, type);
        if (smsPreference === 'sms' || smsPreference === 'both') {
          await sendSms(phoneNumber, notificationContent.sms);
          result.sms = true;
          logger.info(`SMS notification sent to ${phoneNumber} for type ${type}`);
        }
      } catch (error) {
        logger.error(`Error sending SMS notification to ${phoneNumber}:`, error);
      }
    }

    return result;
  } catch (error) {
    logger.error(`Error in multi-channel notification for user ${userId} and type ${type}:`, error);
    // Continue execution by returning the result so far
    return result;
  }
};

const deleteNotification = async (userId, notificationId) => {
  const NotificationModel = await Notification();
  const notification = await NotificationModel.findById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await notification.delete();
  return notification;
};

const readAllNotifications = async (userId) => {
  const NotificationModel = await Notification();
  await NotificationModel.updateMany({ userId }, { isRead: true });
};

/**
 * Notification templates registry - centralized definitions for all notification types
 */
const NOTIFICATION_TEMPLATES = {
  WITHDRAWAL_REQUEST: {
    inApp: {
      title: 'Withdrawal Request Received',
      bodyTemplate:
        'Your withdrawal request of ₦{{amount}} from account {{accountNumber}} has been received. It will be processed within 2 working days.',
    },
    email: {
      subject: 'Withdrawal Request Received',
      template: 'WITHDRAWAL_REQUEST',
    },
    sms: 'Your withdrawal request of ₦{{amount}} has been received. It will be processed within 2 working days.',
  },

  WITHDRAWAL_APPROVED: {
    inApp: {
      title: 'Withdrawal Request Approved',
      bodyTemplate: 'Your withdrawal request of ₦{{amount}} has been processed.',
    },
    email: {
      subject: 'Withdrawal Request Approved',
      template: 'WITHDRAWAL_APPROVED',
    },
    sms: 'Your withdrawal request of ₦{{amount}} from account {{accountNumber}} has been approved and is being processed.',
  },

  WITHDRAWAL_SUCCESS: {
    inApp: {
      title: 'Withdrawal Successful',
      bodyTemplate: 'Your withdrawal of ₦{{amount}} from account {{accountNumber}} has been processed successfully.',
    },
    email: {
      subject: 'Withdrawal Processed Successfully',
      template: 'WITHDRAWAL_SUCCESS',
    },
    sms: 'Your withdrawal of ₦{{amount}} from account {{accountNumber}} has been processed successfully.',
  },

  WITHDRAWAL_FAILED: {
    inApp: {
      title: 'Withdrawal Failed',
      bodyTemplate: 'Your withdrawal of ₦{{amount}} from account {{accountNumber}} failed to process.',
    },
    email: {
      subject: 'Withdrawal Failed',
      template: 'WITHDRAWAL_FAILED',
    },
    sms: 'Your withdrawal of ₦{{amount}} from account {{accountNumber}} failed to process.',
  },

  // Package related notifications
  PACKAGE_CREATED: {
    inApp: {
      title: 'Package Created Successfully',
      bodyTemplate: 'Your {{packageType}} package for {{target}} has been created successfully.',
    },
    email: {
      subject: 'Package Created Successfully',
      template: 'PACKAGE_CREATION',
    },
    sms: 'Your {{packageType}} package for {{target}} has been created successfully.',
  },

  CONTRIBUTION: {
    inApp: {
      title: 'Contribution Confirmation',
      bodyTemplate: 'Your contribution of ₦{{amount}} has been successfully processed.',
    },
    email: {
      subject: 'Contribution Confirmation',
      template: 'CONTRIBUTION',
    },
    sms: 'Your contribution of ₦{{amount}} to account {{accountNumber}} was successful. New balance: ₦{{totalContribution}}.',
  },

  // order updates
  ORDER_CREATED: {
    inApp: {
      title: 'Order Confirmation',
      bodyTemplate: 'Your order #{{orderNumber}} for ₦{{totalAmount}} has been placed successfully.',
    },
    email: {
      subject: 'Order Confirmation',
      template: 'ORDER-CREATED',
    },
    sms: 'Your order #{{orderNumber}} for ₦{{totalAmount}} has been placed successfully.',
  },

  ORDER_PAYMENT: {
    inApp: {
      title: 'Payment Confirmation',
      bodyTemplate: 'Your payment of ₦{{totalAmount}} for order #{{orderNumber}} was successful.',
    },
    email: {
      subject: 'Payment Confirmation',
      template: 'ORDER-PAYMENT',
    },
    sms: 'Your payment of ₦{{totalAmount}} for order #{{orderNumber}} was successful.',
  },
};

/**
 * Fill template string with data values
 * @param {string} template - Template string with {{placeholders}}
 * @param {Object} data - Data object with values
 * @returns {string} Filled template
 */
const fillTemplate = (template, data) => {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

/**
 * Get notification content from templates based on type and data
 * @param {string} templateType - Template type from NOTIFICATION_TEMPLATES
 * @param {Object} data - Data to fill in templates
 * @returns {Object} Notification content for different channels
 */
const getNotificationContent = (templateType, data) => {
  const template = NOTIFICATION_TEMPLATES[templateType];
  if (!template) {
    logger.warn(`Notification template not found: ${templateType}`);
    return {};
  }

  const content = {};

  // Process in-app notification
  if (template.inApp) {
    content.inApp = {
      title: template.inApp.title,
      body: fillTemplate(template.inApp.bodyTemplate, data),
    };
  }

  // Process email notification
  if (template.email) {
    content.email = {
      subject: template.email.subject,
      template: template.email.template,
      templateData: {
        ...data,
        date: data.date || new Date(),
      },
    };
  }

  return content;
};

/**
 * Send templated notification - simplified API for sending notifications
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID
 * @param {string} params.templateType - Template type from NOTIFICATION_TEMPLATES
 * @param {Object} params.data - Data to fill templates with
 * @param {Object} [params.user] - User object (optional, will be fetched if not provided)
 * @param {Object} [params.metadata] - Additional metadata for the notification
 * @returns {Promise<Object>} Result with status of each channel
 */
const sendTemplatedNotification = async ({ userId, templateType, data, user, metadata = {} }) => {
  if (!NOTIFICATION_TEMPLATES[templateType]) {
    logger.warn(`Invalid notification template type: ${templateType}`);
    return { inApp: false, email: false, sms: false };
  }

  // Get appropriate notification type for preference checking
  const notificationType = templateType.toLowerCase();

  const notificationContent = getNotificationContent(templateType, data);

  return sendMultiChannelNotification({
    userId,
    type: notificationType,
    user,
    data,
    notificationContent,
    notificationData: {
      reference: data.reference || metadata.reference,
      relatedEntityId: data.relatedEntityId || metadata.relatedEntityId || data.packageId,
      relatedEntityType: data.relatedEntityType || metadata.relatedEntityType,
    },
  });
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
  sendMultiChannelNotification,
  deleteNotification,
  readAllNotifications,
  NOTIFICATION_TEMPLATES,
  sendTemplatedNotification,
  getNotificationContent,
};
