const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const notificationValidation = require('../../validations/notification.validation');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router
  .route('/all')
  .get(auth('notifications'), validate(notificationValidation.getNotifications), notificationController.getNotifications);

router
  .route('/count')
  .get(
    auth('notifications'),
    validate(notificationValidation.pendingNotificationCount),
    notificationController.pendingNotificationCount
  );

router.route('/:notificationId').delete(auth('notifications'), notificationController.deleteNotification);

router
  .route('/:notificationId/mark-as-read')
  .post(
    auth('notifications'),
    validate(notificationValidation.markNotificationAsRead),
    notificationController.markNotificationAsRead
  );

router.route('/read-all').post(auth('notifications'), notificationController.readAllNotifications);

router
  .route('/preferences')
  .get(auth(), notificationController.getPreferences)
  .put(auth(), validate(notificationValidation.updatePreferences), notificationController.updatePreferences);

router.get('/types', auth(), notificationController.getNotificationTypes);
router.post('/unsubscribe', auth(), notificationController.unsubscribeFromAll);
router.post('/unsubscribe/:type', auth(), notificationController.unsubscribeFromNotificationType);
module.exports = router;
