const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dailySavingsValidation = require('../../validations/dailySavings.validation');
const dailySavingsController = require('../../controllers/dailySavings.controller');

const router = express.Router();

router
  .route('/package')
  .post(
    auth('manageSavings'),
    validate(dailySavingsValidation.createDailySavingsPackage),
    dailySavingsController.createDailySavingsPackage
  );

router
  .route('/')
  .post(
    auth('manageSavings'),
    validate(dailySavingsValidation.saveDailyContribution),
    dailySavingsController.saveDailyContribution
  );

module.exports = router;
