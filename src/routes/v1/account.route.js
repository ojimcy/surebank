const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountValidation = require('../../validations/account.validation');
const accountController = require('../../controllers/account.controller');
const accountingController = require('../../controllers/Accounting.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageAccounts'), validate(accountValidation.createAccount), accountController.createAccount)
  .get(auth('manageAccounts'), validate(accountValidation.getAllAccounts), accountController.getAllAccounts);

router
  .route('/:userId')
  .get(auth('getUserAccount'), validate(accountValidation.getUserAccount), accountController.getUserAccount)
  .delete(auth('manageAccounts'), validate(accountValidation.deleteAccount), accountController.deleteAccount);

router
  .route('/:accountId')
  .patch(auth('manageAccounts'), validate(accountValidation.updateAccount), accountController.updateAccount);

router
  .route('/:accountId/assign-branch')
  .post(auth('manageAccounts'), validate(accountValidation.assignBranch), accountController.assignBranch);

router
  .route('/:accountId/assign-manager')
  .post(auth('assignManager'), validate(accountValidation.assignManager), accountController.assignManager);

router
  .route('/entry')
  .post(auth('addEntry'), validate(accountValidation.ledgerEntry), accountingController.ledgerEntry)
  .get(auth('getEntry'), validate(accountValidation.getLedgerEntries), accountingController.getLedgerEntries);

module.exports = router;
