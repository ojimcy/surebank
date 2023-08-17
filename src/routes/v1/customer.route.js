const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const customerValidation = require('../../validations/customer.validation');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageCustomer'), validate(customerValidation.createCustomer), customerController.createCustomer);

router
  .route('/my-clients')
  .get(
    auth('manageCustomer'),
    validate(customerValidation.getCustomersByUserReps),
    customerController.getCustomersByUserReps
  );

router
  .route('/transactions/deposit')
  .post(auth('makeDeposit'), validate(customerValidation.makeDeposit), customerController.makeDeposit);

router
  .route('/transactions/withdraw')
  .post(auth('makeWithdrawal'), validate(customerValidation.makeWithdrawal), customerController.makeWithdrawal);

module.exports = router;
