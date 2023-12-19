const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reportsValidation = require('../../validations/reports.validation');
const reportsController = require('../../controllers/reports.controller');

const router = express.Router();
router
  .route('/total-contributions')
  .get(auth('dashboardReports'), validate(reportsValidation.getTotalContributions), reportsController.getTotalContributions);

router
  .route('/total-savings-withdrawal')
  .get(
    auth('dashboardReports'),
    validate(reportsValidation.getDailySavingsWithdrawals),
    reportsController.getDailySavingsWithdrawals
  );

router
  .route('/packages')
  .get(auth('packageReports'), validate(reportsValidation.getPackages), reportsController.getPackages);

router
  .route('/user-reps/packages')
  .get(auth('getReports'), validate(reportsValidation.getTotalContributions), reportsController.getPackageReportForUserRep);

router.route('/packages/charged').get(auth('reports'), reportsController.getChargedPackages);
router.route('/packages/sb/charged').get(auth('reports'), reportsController.getChargedSbPackages);
router.route('/charges').get(auth('reports'), validate(reportsValidation.getCharges), reportsController.getCharges);

router.route('/contribution-incomes/supperadmin').get(auth('accounting'), reportsController.getSumOfFirstContributions);

module.exports = router;
