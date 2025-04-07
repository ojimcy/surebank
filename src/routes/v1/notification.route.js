const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const notificationValidation = require('../../validations/notification.validation');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router
  .route('/')
  .get(auth('getNitifications'), validate(notificationValidation.getNotifications), notificationController.getNotifications);

router
  .route('/count')
  .get(
    auth('getPendingNotificationCount'),
    validate(notificationValidation.pendingNotificationCount),
    notificationController.pendingNotificationCount
  );

router
  .route('/:notificationId/mark-as-read')
  .post(
    auth('markNotificationAsRead'),
    validate(notificationValidation.markNotificationAsRead),
    notificationController.markNotificationAsRead
  );

router
  .route('/preferences')
  .get(auth(), notificationController.getPreferences)
  .put(auth(), validate(notificationValidation.updatePreferences), notificationController.updatePreferences);

router.get('/types', auth(), notificationController.getNotificationTypes);
router.post('/unsubscribe', auth(), notificationController.unsubscribeFromAll);

module.exports = router;
