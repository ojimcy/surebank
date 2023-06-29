const Joi = require('joi');
const { objectId } = require('./custom.validation');

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

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
};
