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

const deleteNotification = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const notification = await notificationService.deleteNotification(userId, req.params.notificationId);
  res.send(notification);
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const notification = await notificationService.markNotificationAsRead(userId, req.params.notificationId);
  res.send(notification);
});

const readAllNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const notification = await notificationService.readAllNotifications(userId);
  res.send(notification);
});

const getPreferences = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const preferences = await notificationService.getUserPreferences(userId);
  res.send(preferences);
});

const updatePreferences = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const preferences = await notificationService.updateUserPreferences(userId, req.body);
  res.send(preferences);
});

const unsubscribeFromAll = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const preferences = await notificationService.unsubscribeFromAll(userId);
  res.send(preferences);
});

const getNotificationTypes = catchAsync(async (req, res) => {
  res.send({
    types: notificationService.NOTIFICATION_TYPES,
    channels: notificationService.NOTIFICATION_CHANNELS,
  });
});

const unsubscribeFromNotificationType = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const preferences = await notificationService.unsubscribeFromNotificationType(userId, req.params.type);
  res.send(preferences);
});

const applyPreset = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { preset } = req.body;
  const preferences = await notificationService.applyPreset(userId, preset);
  res.send(preferences);
});

const updateCategoryPreferences = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { category, channels } = req.body;
  const preferences = await notificationService.updateCategoryPreferences(userId, category, channels);
  res.send(preferences);
});

const getPresets = catchAsync(async (req, res) => {
  const presets = notificationService.getAvailablePresets();
  res.send(presets);
});

const getCategories = catchAsync(async (req, res) => {
  const categories = notificationService.getNotificationCategories();
  res.send(categories);
});

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
  getPreferences,
  updatePreferences,
  unsubscribeFromAll,
  getNotificationTypes,
  unsubscribeFromNotificationType,
  deleteNotification,
  readAllNotifications,
  applyPreset,
  updateCategoryPreferences,
  getPresets,
  getCategories,
};
