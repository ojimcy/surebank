const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountingValidation = require('../../validations/accounting.validation');
const expenditureValidation = require('../../validations/expenditure.validation');
const accountingController = require('../../controllers/accounting.controller');
const expenditureController = require('../../controllers/expenditure.controller');
const corsMiddleware = require('../../middlewares/cors');

const router = express.Router();
// cors middleware
router.use(corsMiddleware);

router
  .route('/entry')
  .post(auth('addEntry'), validate(accountingValidation.ledgerEntry), accountingController.ledgerEntry)
  .get(auth('getEntries'), validate(accountingValidation.getLedgerEntries), accountingController.getLedgerEntries);

router
  .route('/daily-summary')
  .post(auth('manageSummary'), validate(accountingValidation.computeDailySummary), accountingController.computeDailySummary)
  .get(auth('manageSummary'), validate(accountingValidation.getDailySummary), accountingController.getDailySummary);

router
  .route('/expenditure')
  .post(
    auth('manageExpenditure'),
    validate(expenditureValidation.createExpenditure),
    expenditureController.createExpenditure
  )
  .get(
    auth('manageExpenditure'),
    validate(expenditureValidation.getExpendituresByDateRange),
    expenditureController.getExpendituresByDateRange
  );

router.route('/expenditure/total').get(auth('manageExpenditure'), expenditureController.getTotalExpenditure);
router.route('/expenditure/user-reps').get(auth('manageExpenditure'), expenditureController.getExpendituresByUserReps);
router.route('/expenditure/total/admin').get(auth('manageExpenditure'), expenditureController.getBranchTotalExpenditure);
router.route('/expenditure/total/supperadmin').get(auth('manageExpenditure'), expenditureController.getTotalExpenditure);

router
  .route('/expenditure/:expenditureId')
  .get(
    auth('manageExpenditure'),
    validate(expenditureValidation.getExpenditureById),
    expenditureController.getExpenditureById
  )
  .patch(
    auth('manageExpenditure'),
    validate(expenditureValidation.updateExpenditure),
    expenditureController.updateExpenditure
  )
  .delete(
    auth('manageExpenditure'),
    validate(expenditureValidation.deleteExpenditure),
    expenditureController.deleteExpenditure
  );

router.route('/contribution-incomes/admin').get(auth('accounting'), accountingController.getBranchSumOfFirstContributions);
router.route('/contribution-incomes/supperadmin').get(auth('accounting'), accountingController.getSumOfFirstContributions);

module.exports = router;
