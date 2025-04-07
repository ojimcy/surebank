const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const notificationService = require('../services/notification.service');

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const filter = pick(req.query, ['type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await notificationService.getNotifications(userId, filter, options);
  res.send(result);
});

const pendingNotificationCount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const count = await notificationService.getUnreadNotificationsCount(userId);
  res.send({ count });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.user._id, req.params.notificationId);
  res.send(notification);
});

const getPreferences = catchAsync(async (req, res) => {
  const preferences = await notificationService.getUserPreferences(req.user.id);
  res.send(preferences);
});

const updatePreferences = catchAsync(async (req, res) => {
  const preferences = await notificationService.updateUserPreferences(req.user.id, req.body);
  res.send(preferences);
});

const unsubscribeFromAll = catchAsync(async (req, res) => {
  const preferences = await notificationService.unsubscribeFromAll(req.user.id);
  res.send(preferences);
});

const getNotificationTypes = catchAsync(async (req, res) => {
  res.send({
    types: notificationService.NOTIFICATION_TYPES,
    channels: notificationService.NOTIFICATION_CHANNELS,
  });
});

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
  getPreferences,
  updatePreferences,
  unsubscribeFromAll,
  getNotificationTypes,
};
