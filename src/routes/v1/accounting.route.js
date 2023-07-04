const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountingValidation = require('../../validations/account.validation');
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

module.exports = router;
