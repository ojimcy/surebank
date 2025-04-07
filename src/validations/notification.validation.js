const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { NotificationPreference } = require('../models');

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
      Joi.string().valid(...NotificationPreference.NOTIFICATION_TYPES),
      Joi.object({
        channel: Joi.string().valid(...NotificationPreference.NOTIFICATION_CHANNELS),
        enabled: Joi.boolean(),
      })
    ),
    unsubscribedFromAll: Joi.boolean(),
  }),
};

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
  updatePreferences,
};
