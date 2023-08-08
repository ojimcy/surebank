const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountingValidation = require('../../validations/accounting.validation');
const accountingController = require('../../controllers/Accounting.controller');

const router = express.Router();

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
  .post(auth('manageExpenditure'), validate(accountingValidation.createExpenditure), accountingController.createExpenditure)
  .get(
    auth('manageExpenditure'),
    validate(accountingValidation.getExpendituresByDateRange),
    accountingController.getExpendituresByDateRange
  );

router
  .route('/expenditure/:expenditureId')
  .get(auth('manageExpenditure'), validate(accountingValidation.getExpenditureById), accountingController.getExpenditureById)
  .patch(auth('manageExpenditure'), validate(accountingValidation.updateExpenditure), accountingController.updateExpenditure)
  .delete(
    auth('manageExpenditure'),
    validate(accountingValidation.deleteExpenditure),
    accountingController.deleteExpenditure
  );

module.exports = router;
