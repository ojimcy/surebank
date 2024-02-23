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
    validate(reportsValidation.getTotalContributions),
    reportsController.getDailySavingsWithdrawals
  );

router
  .route('/packages/sb')
  .get(auth('packageReports'), validate(reportsValidation.getPackages), reportsController.getSbPackages);
router
  .route('/packages')
  .get(auth('packageReports'), validate(reportsValidation.getPackages), reportsController.getPackages);

router
  .route('/user-reps/total-savings-withdrawal')
  .get(
    auth('getTotalWithdrawals'),
    validate(reportsValidation.getMyTotalContributions),
    reportsController.getMyDsWithdrawals
  );

router.route('/packages/charged').get(auth('reports'), reportsController.getChargedPackages);

router.route('/packages/sb/charged').get(auth('reports'), reportsController.getChargedSbPackages);

router.route('/charges').get(auth('reports'), validate(reportsValidation.getCharges), reportsController.getCharges);
router
  .route('/charges/others')
  .get(auth('reports'), validate(reportsValidation.getCharges), reportsController.getOtherCharges);

router.route('/contribution-incomes/ds/supperadmin').get(auth('reports'), reportsController.getSumOfDsCharges);
router.route('/contribution-incomes/sb/supperadmin').get(auth('reports'), reportsController.getSumOfSbCharges);
router.route('/contribution-incomes/others/supperadmin').get(auth('reports'), reportsController.getSumOfOtherCharges);

router.route('/packages/contributions').get(auth('contributionsReports'), reportsController.getDailyContributions);

module.exports = router;
