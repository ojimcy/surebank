const httpStatus = require('http-status');
const Notification = require('../models/notification.model');
const ApiError = require('../utils/ApiError');

const createNotification = async (input) => {
  const notification = await Notification.create(input);
  return notification;
};

const getNotifications = async (userId, filter, options) => {
  const notifications = await Notification.paginate({ userId, ...filter }, options);
  return notifications;
};

const getUnreadNotificationsCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return count;
};

const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await Notification.findById(notificationId);
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

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
};
