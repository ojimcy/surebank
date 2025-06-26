const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reportsValidation = require('../../validations/reports.validation');
const reportsController = require('../../controllers/reports.controller');
const corsMiddleware = require('../../middlewares/cors');

const router = express.Router();

// cors middleware
router.use(corsMiddleware);

// === CONTRIBUTION REPORTS ===
router
  .route('/total-contributions')
  .get(auth('dashboardReports'), validate(reportsValidation.getTotalContributions), reportsController.getTotalContributions);

router
  .route('/packages/contributions')
  .get(
    auth('contributionsReports'),
    validate(reportsValidation.getDailyContributions),
    reportsController.getDailyContributions
  );

// === WITHDRAWAL REPORTS ===
router
  .route('/total-savings-withdrawal')
  .get(
    auth('dashboardReports'),
    validate(reportsValidation.getTotalContributions),
    reportsController.getDailySavingsWithdrawals
  );

router
  .route('/user-reps/total-savings-withdrawal')
  .get(
    auth('getTotalWithdrawals'),
    validate(reportsValidation.getMyTotalContributions),
    reportsController.getMyDsWithdrawals
  );

// === PACKAGE REPORTS ===
router
  .route('/packages')
  .get(auth('packageReports'), validate(reportsValidation.getPackages), reportsController.getPackages);

router
  .route('/packages/sb')
  .get(auth('packageReports'), validate(reportsValidation.getPackages), reportsController.getSbPackages);

router.route('/packages/charged').get(auth('reports'), reportsController.getChargedPackages);

router.route('/packages/sb/charged').get(auth('reports'), reportsController.getChargedSbPackages);

// === CHARGES REPORTS ===
router.route('/charges').get(auth('reports'), validate(reportsValidation.getCharges), reportsController.getCharges);

router
  .route('/charges/others')
  .get(auth('reports'), validate(reportsValidation.getCharges), reportsController.getOtherCharges);

// === INCOME SUMMARIES ===
router
  .route('/contribution-incomes/ds/supperadmin')
  .get(auth('reports'), validate(reportsValidation.getIncomeSummary), reportsController.getSumOfDsCharges);

router
  .route('/contribution-incomes/sb/supperadmin')
  .get(auth('reports'), validate(reportsValidation.getIncomeSummary), reportsController.getSumOfSbCharges);

router
  .route('/contribution-incomes/others/supperadmin')
  .get(auth('reports'), validate(reportsValidation.getIncomeSummary), reportsController.getSumOfOtherCharges);

// === DASHBOARD SUMMARY ===
router
  .route('/dashboard-summary')
  .get(auth('dashboardReports'), validate(reportsValidation.getDashboardSummary), reportsController.getDashboardSummary);

module.exports = router;
