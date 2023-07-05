const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountTransactionValidation = require('../../validations/accountTransaction.validation');
const accountTransactionController = require('../../controllers/accountTransaction.controller');

const router = express.Router();

router
  .route('/balance')
  .post(
    auth('viewBalance'),
    validate(accountTransactionValidation.getAccountBalance),
    accountTransactionController.getAccountBalance
  );

router
  .route('/deposit')
  .post(
    auth('manageCustomerTransaction'),
    validate(accountTransactionValidation.makeCustomerDeposit),
    accountTransactionController.makeCustomerDeposit
  );

router
  .route('/withdraw')
  .post(
    auth('manageCustomerTransaction'),
    validate(accountTransactionValidation.makeCustomerWithdrawal),
    accountTransactionController.makeCustomerWithdrawal
  );

module.exports = router;
