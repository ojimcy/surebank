const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountTransactionValidation = require('../../validations/accountTransaction.validation');
const accountTransactionController = require('../../controllers/accountTransaction.controller');
const corsMiddleware = require('../../middlewares/cors');

const router = express.Router();
// cors middleware
router.use(corsMiddleware);

router
  .route('/')
  .get(
    auth('accountTransactions'),
    validate(accountTransactionValidation.getAccountTransactions),
    accountTransactionController.getAccountTransactions
  );

router
  .route('/user')
  .get(
    auth('accountTransactions'),
    validate(accountTransactionValidation.getAccountTransactions),
    accountTransactionController.getAccountByNumber
  );

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
    auth('approveWithdrawals'),
    validate(accountTransactionValidation.makeCustomerWithdrawal),
    accountTransactionController.makeCustomerWithdrawal
  );

router
  .route('/withdrawals')
  .get(
    auth('getCustomerWithdrawals'),
    validate(accountTransactionValidation.getCustomerwithdrawals),
    accountTransactionController.getCustomerwithdrawals
  );

router
  .route('/withdraw/cash')
  .post(
    auth('requestCash'),
    validate(accountTransactionValidation.makeWithdrawalRequest),
    accountTransactionController.makeWithdrawalRequest
  )
  .get(
    auth('requestCash'),
    validate(accountTransactionValidation.getAllWithdrawalRequests),
    accountTransactionController.getAllWithdrawalRequests
  );

router
  .route('/withdraw/cash/:requestId')
  .get(
    auth('requestCash'),
    validate(accountTransactionValidation.getWithdrawalRequestById),
    accountTransactionController.getWithdrawalRequestById
  )
  .post(
    auth('rejectWithdrawalRequests'),
    validate(accountTransactionValidation.rejectWithdrawalRequest),
    accountTransactionController.rejectWithdrawalRequest
  );

router.route('/held-amount').get(auth('rejectWithdrawalRequests'), accountTransactionController.getHeldAmount);

module.exports = router;
