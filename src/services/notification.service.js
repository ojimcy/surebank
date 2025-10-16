const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Notification, NotificationPreference, User } = require('../models');
const logger = require('../config/logger');
const notificationPreferenceSchema = require('../models/notificationPreference.schema');
const { queueEmail, EMAIL_PRIORITIES } = require('./emailQueue.service');
const { sendSms } = require('./sms.service');
const {
  getPreset,
  getAllPresets,
  getCategoryTypes,
  getAllCategories,
  detectPreset,
} = require('../config/notificationPresets');

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
    logger.info(`Starting multi-channel notification for user ${userId}, type: ${type}`);

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

        logger.info(`Sending in-app notification to user ${userId} for type ${type}`);
        await sendNotification(userId, type, inAppData);
        result.inApp = true;
        logger.info(`In-app notification sent successfully to user ${userId} for type ${type}`);
      } catch (error) {
        logger.error(`Error sending in-app notification to user ${userId} for type ${type}:`, {
          error: error.message,
          stack: error.stack,
        });
      }
    }

    // Send email notification if enabled for this type
    if (notificationContent.email && userToUse.email) {
      try {
        const emailPreference = await getUserNotificationPreference(userId, type);

        if (!emailPreference || emailPreference === 'none') {
          logger.info(`Email notification skipped for user ${userId} - preference is ${emailPreference || 'none'} for type ${type}`);
        } else if (emailPreference === 'email' || emailPreference === 'both') {
          const { subject, template, templateData, html } = notificationContent.email;

          // Determine email priority based on notification type
          const getEmailPriority = (notificationType) => {
            const highPriorityTypes = ['security_alert', 'login_alert', 'password_reset', 'account_activity', 'withdrawal_failed', 'withdrawal_success', 'withdrawal_approval'];
            const normalPriorityTypes = ['transaction_alert', 'payment_confirmation', 'package_created', 'contribution_notification', 'deposit_confirmation', 'withdrawal_request'];

            if (highPriorityTypes.includes(notificationType)) {
              return EMAIL_PRIORITIES.HIGH;
            } else if (normalPriorityTypes.includes(notificationType)) {
              return EMAIL_PRIORITIES.NORMAL;
            }
            return EMAIL_PRIORITIES.NORMAL;
          };

          const priority = getEmailPriority(type);

          // Support both template-based and direct HTML emails
          // All emails are now queued for consistency and reliability
          if (html) {
            // Queue HTML email for better reliability and performance
            logger.info(`Queueing HTML email to ${userToUse.email} for type ${type} with priority ${priority}`);
            await queueEmail({
              to: userToUse.email,
              subject,
              html,
              tracking: { opens: true, clicks: true }
            }, { priority });
          } else {
            // Queue all template-based emails through the email queue
            // This ensures consistent delivery and respects user preferences
            logger.info(`Queueing template email (${template}) to ${userToUse.email} for type ${type} with priority ${priority}`);
            await queueEmail({
              to: userToUse.email,
              subject,
              template,
              templateData,
              tracking: { opens: true, clicks: true }
            }, { priority });
          }

          result.email = true;
          logger.info(`Email notification queued successfully to ${userToUse.email} for type ${type}`);
        }
      } catch (error) {
        logger.error(`Error sending email notification to ${userToUse.email} for type ${type}:`, {
          error: error.message,
          stack: error.stack,
          userId,
          type,
        });
      }
    } else if (!userToUse.email) {
      logger.warn(`Email notification skipped for user ${userId} - no email address available`);
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

    logger.info(`Multi-channel notification completed for user ${userId}, type: ${type}. Results: inApp=${result.inApp}, email=${result.email}, sms=${result.sms}`);
    return result;
  } catch (error) {
    logger.error(`Error in multi-channel notification for user ${userId} and type ${type}:`, {
      error: error.message,
      stack: error.stack,
      userId,
      type,
    });
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
  // Withdrawal notifications
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
      bodyTemplate: 'Your withdrawal request of ₦{{amount}} has been approved.',
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

  // Deposit notifications
  DEPOSIT_CONFIRMATION: {
    inApp: {
      title: 'Deposit Successful',
      bodyTemplate: 'Your account has been credited with ₦{{amount}}. New balance: ₦{{newBalance}}.',
    },
    email: {
      subject: 'Deposit Confirmation',
      template: 'DEPOSIT_CONFIRMATION',
    },
    sms: 'Your account {{accountNumber}} has been credited with ₦{{amount}}. New balance: ₦{{newBalance}}.',
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

  PACKAGE_MATURITY_ALERT: {
    inApp: {
      title: 'Package Matured',
      bodyTemplate: 'Your {{packageName}} package has matured. Total amount: ₦{{currentBalance}}.',
    },
    email: {
      subject: 'Package Maturity Alert',
      template: 'PACKAGE_MATURITY_ALERT',
    },
    sms: 'Your {{packageName}} package has matured. Total: ₦{{currentBalance}}. Login to withdraw.',
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

  // Authentication notifications
  // Note: OTP-based notifications (verify_email, reset_password) should NOT have in-app notifications
  // because users cannot access them before logging in/verifying their account
  VERIFY_EMAIL: {
    email: {
      subject: 'Verify Your Email Address',
      template: 'VERIFY_EMAIL',
    },
    sms: 'Your SureBank verification code is: {{otp}}. Valid for {{expiryTime}} minutes.',
  },

  RESET_PASSWORD: {
    email: {
      subject: 'Reset Your Password',
      template: 'RESET_PASSWORD',
    },
    sms: 'Your SureBank password reset code is: {{otp}}. Valid for {{expiryTime}} minutes.',
  },

  // Security notifications
  SECURITY_ALERT: {
    inApp: {
      title: 'Security Alert',
      bodyTemplate: 'Unusual activity detected on your account: {{alertType}}',
    },
    email: {
      subject: 'Security Alert - Important Account Activity',
      template: 'SECURITY_ALERT',
    },
    sms: 'Security alert: {{alertType}}. If this wasn\'t you, contact support immediately.',
  },

  LOGIN_ALERT: {
    inApp: {
      title: 'New Login Detected',
      bodyTemplate: 'New login from {{location}} at {{timestamp}}.',
    },
    email: {
      subject: 'New Login to Your Account',
      template: 'LOGIN_ALERT',
    },
    sms: 'New login detected from {{location}}. If this wasn\'t you, secure your account immediately.',
  },

  // KYC notifications
  KYC_UPDATE: {
    inApp: {
      title: 'KYC Status Update',
      bodyTemplate: 'Your KYC verification status: {{status}}.',
    },
    email: {
      subject: 'KYC Verification Update',
      template: 'KYC_UPDATE',
    },
    sms: 'Your KYC verification is {{status}}. {{message}}',
  },

  // Order notifications
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

  ORDER_SHIPPED: {
    inApp: {
      title: 'Order Shipped',
      bodyTemplate: 'Your order #{{orderNumber}} has been shipped and is on its way.',
    },
    email: {
      subject: 'Your Order Has Been Shipped',
      template: 'ORDER-SHIPPED',
    },
    sms: 'Your order #{{orderNumber}} has been shipped. Track: {{trackingNumber}}',
  },

  ORDER_DELIVERED: {
    inApp: {
      title: 'Order Delivered',
      bodyTemplate: 'Your order #{{orderNumber}} has been delivered.',
    },
    email: {
      subject: 'Order Delivered Successfully',
      template: 'ORDER-DELIVERED',
    },
    sms: 'Your order #{{orderNumber}} has been delivered. Enjoy!',
  },

  // Account activity notifications
  TRANSACTION_ALERT: {
    inApp: {
      title: 'Transaction Alert',
      bodyTemplate: '₦{{amount}} {{direction}} - {{narration}}. New balance: ₦{{balance}}.',
    },
    email: {
      subject: 'Transaction Alert',
      template: 'TRANSACTION_ALERT',
    },
    sms: '₦{{amount}} {{direction}} - {{narration}}. Balance: ₦{{balance}}',
  },

  ACCOUNT_ACTIVITY: {
    inApp: {
      title: 'Account Activity',
      bodyTemplate: 'Activity on your account: {{activity}}',
    },
    email: {
      subject: 'Account Activity Notification',
      template: 'ACCOUNT_ACTIVITY',
    },
    sms: 'Account activity: {{activity}}',
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

/**
 * Apply a notification preset to user preferences
 * @param {ObjectId} userId - User ID
 * @param {string} presetName - Preset name ('minimal', 'balanced', 'everything')
 * @returns {Promise<NotificationPreference>}
 */
const applyPreset = async (userId, presetName) => {
  const NotificationPreferenceModel = await NotificationPreference();

  // Validate preset name
  if (!['minimal', 'balanced', 'everything'].includes(presetName)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid preset: ${presetName}`);
  }

  // Get the preset configuration
  const preset = getPreset(presetName);

  // Get or create user preferences
  let preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    preferences = await NotificationPreferenceModel.create({ userId });
  }

  // Apply preset preferences
  Object.entries(preset.preferences).forEach(([type, channel]) => {
    preferences.preferences.set(type, channel);
  });

  // Update preset field
  preferences.preset = presetName;

  await preferences.save();
  logger.info(`Applied ${presetName} preset for user ${userId}`);
  return preferences;
};

/**
 * Update notification preferences for an entire category
 * @param {ObjectId} userId - User ID
 * @param {string} category - Category name
 * @param {Array<string>} channels - Array of enabled channels ('in-app', 'email', 'sms')
 * @returns {Promise<NotificationPreference>}
 */
const updateCategoryPreferences = async (userId, category, channels) => {
  const NotificationPreferenceModel = await NotificationPreference();

  // Get category notification types
  const categoryTypes = getCategoryTypes(category);
  if (categoryTypes.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid category: ${category}`);
  }

  // Validate channels
  if (!Array.isArray(channels)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Channels must be an array');
  }

  // Convert channels array to notification channel string
  let channelValue;
  if (channels.length === 0) {
    channelValue = 'none';
  } else if (channels.length === 3 || (channels.includes('in-app') && channels.includes('email'))) {
    channelValue = 'both';
  } else if (channels.length === 1) {
    channelValue = channels[0];
  } else {
    // For 2 channels that aren't in-app+email, use 'both'
    channelValue = 'both';
  }

  // Get user preferences
  let preferences = await NotificationPreferenceModel.findOne({ userId });
  if (!preferences) {
    preferences = await NotificationPreferenceModel.create({ userId });
  }

  // Update all types in the category
  categoryTypes.forEach((type) => {
    preferences.preferences.set(type, channelValue);
  });

  // Switch to custom preset since user is making manual changes
  preferences.preset = 'custom';

  await preferences.save();
  logger.info(`Updated category ${category} preferences for user ${userId}`);
  return preferences;
};

/**
 * Get available notification presets
 * @returns {Object} Available presets
 */
const getAvailablePresets = () => {
  return getAllPresets();
};

/**
 * Get notification categories
 * @returns {Object} Notification categories
 */
const getNotificationCategories = () => {
  return getAllCategories();
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
  applyPreset,
  updateCategoryPreferences,
  getAvailablePresets,
  getNotificationCategories,
};
