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
  )
  .get(
    auth('userPackage'),
    validate(dailySavingsValidation.getUserDailySavingsPackage),
    dailySavingsController.getUserDailySavingsPackage
  );

router
  .route('/make-contribution')
  .post(
    auth('manageSavings'),
    validate(dailySavingsValidation.saveDailyContribution),
    dailySavingsController.saveDailyContribution
  );

router
  .route('/withdraw')
  .post(
    auth('manageSavings'),
    validate(dailySavingsValidation.makeDailySavingsWithdrawal),
    dailySavingsController.makeDailySavingsWithdrawal
  );

router
  .route('/activities')
  .get(
    auth('userPackage'),
    validate(dailySavingsValidation.getUserSavingsActivities),
    dailySavingsController.getUserSavingsActivities
  );

module.exports = router;
