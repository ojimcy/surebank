const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const customerValidation = require('../../validations/customer.validation');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageCustomer'), validate(customerValidation.createCustomer), customerController.createCustomer);

module.exports = router;
