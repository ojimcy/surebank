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

module.exports = {
  getNotifications,
  pendingNotificationCount,
  markNotificationAsRead,
};
