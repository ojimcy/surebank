const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const scheduledContributionValidation = require('../../validations/scheduledContribution.validation');
const scheduledContributionController = require('../../controllers/scheduledContribution.controller');

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(scheduledContributionValidation.createSchedule), scheduledContributionController.createSchedule)
    .get(auth(), validate(scheduledContributionValidation.getUserSchedules), scheduledContributionController.getUserSchedules);

router
    .route('/stats')
    .get(auth(), scheduledContributionController.getScheduleStats);

router
    .route('/:scheduleId')
    .get(auth(), validate(scheduledContributionValidation.getSchedule), scheduledContributionController.getSchedule)
    .patch(auth(), validate(scheduledContributionValidation.updateSchedule), scheduledContributionController.updateSchedule);

router
    .route('/:scheduleId/pause')
    .patch(auth(), validate(scheduledContributionValidation.pauseSchedule), scheduledContributionController.pauseSchedule);

router
    .route('/:scheduleId/resume')
    .patch(auth(), validate(scheduledContributionValidation.resumeSchedule), scheduledContributionController.resumeSchedule);

router
    .route('/:scheduleId/cancel')
    .patch(auth(), validate(scheduledContributionValidation.cancelSchedule), scheduledContributionController.cancelSchedule);

router
    .route('/:scheduleId/logs')
    .get(auth(), validate(scheduledContributionValidation.getPaymentLogs), scheduledContributionController.getPaymentLogs);

module.exports = router; 