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
  .route('/user-reps/total-contributions')
  .get(auth('getReports'), validate(reportsValidation.getMyTotalContributions), reportsController.getMyTotalContributions);

router
  .route('/user-reps/total-savings-withdrawal')
  .get(
    auth('getTotalWithdrawals'),
    validate(reportsValidation.getMyTotalContributions),
    reportsController.getMyDsWithdrawals
  );

router
  .route('/user-reps/packages')
  .get(auth('getReports'), validate(reportsValidation.getTotalContributions), reportsController.getPackageReportForUserRep);

router
  .route('/total-contributions/:userReps')
  .get(
    auth('reports'),
    validate(reportsValidation.getTotalContributionsByUserReps),
    reportsController.getTotalContributionsByUserReps
  );

router
  .route('/:branchId/total-contributions')
  .get(auth('reports'), validate(reportsValidation.getTotalContributions), reportsController.getContributionsByDayForBranch);

router.route('/packages/charged').get(auth('reports'), reportsController.getChargedPackages);
router.route('/packages/sb/charged').get(auth('reports'), reportsController.getChargedSbPackages);

module.exports = router;
