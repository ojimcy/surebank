const Joi = require('joi');
const { objectId } = require('./custom.validation');
const notificationPreferenceSchema = require('../models/notificationPreference.schema');

const getNotifications = {
  query: Joi.object().keys({
    type: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const pendingNotificationCount = {
  query: Joi.object().keys({
    type: Joi.string(),
  }),
};

const markNotificationAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId), // 2275885054 uba
  }),
};

const updatePreferences = {
  body: Joi.object().keys({
    preferences: Joi.object().pattern(
      Joi.string().valid(...notificationPreferenceSchema.statics.NOTIFICATION_TYPES),
      Joi.string().valid(...notificationPreferenceSchema.statics.NOTIFICATION_CHANNELS)
    ),
    unsubscribedFromAll: Joi.boolean(),
  }),
};

const unsubscribeFromNotificationType = {
  params: Joi.object().keys({
    type: Joi.string().valid(...notificationPreferenceSchema.statics.NOTIFICATION_TYPES),
  }),
};

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
  updatePreferences,
  unsubscribeFromNotificationType,
};
