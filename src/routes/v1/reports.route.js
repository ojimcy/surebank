const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reportsValidation = require('../../validations/reports.validation');
const reportsController = require('../../controllers/reports.controller');

const router = express.Router();
router
  .route('/total-contributions')
  .get(auth('reports'), validate(reportsValidation.getTotalContributions), reportsController.getTotalContributions);

router
  .route('/total-savings-withdrawal')
  .get(auth('reports'), validate(reportsValidation.getTotalContributions), reportsController.getDailySavingsWithdrawals);

router
  .route('/packages')
  .get(auth('reports'), validate(reportsValidation.getTotalContributions), reportsController.getPackageReport);

router
  .route('/total-contributions/:userReps')
  .get(
    auth('reports'),
    validate(reportsValidation.getTotalContributionsByUserReps),
    reportsController.getTotalContributionsByUserReps
  );

module.exports = router;
