const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dailySavingsValidation = require('../../validations/dailySavings.validation');
const dailySavingsController = require('../../controllers/dailySavings.controller');

const router = express.Router();

router
  .route('/package')
  .post(
    auth('createDsPackage'),
    validate(dailySavingsValidation.createDailySavingsPackage),
    dailySavingsController.createDailySavingsPackage
  )
  .get(
    auth('userPackage'),
    validate(dailySavingsValidation.getUserDailySavingsPackages),
    dailySavingsController.getUserDailySavingsPackages
  );

router
  .route('/self-package')
  .post(
    auth('selfAccount'),
    validate(dailySavingsValidation.createUserInitiatedDailySavingsPackage),
    dailySavingsController.createUserInitiatedDailySavingsPackage
  );

router
  .route('/make-contribution')
  .post(
    auth('manageContributions'),
    validate(dailySavingsValidation.saveDailyContribution),
    dailySavingsController.saveDailyContribution
  );

router
  .route('/withdraw')
  .post(
    auth('manageContributions'),
    validate(dailySavingsValidation.makeDailySavingsWithdrawal),
    dailySavingsController.makeDailySavingsWithdrawal
  );

router
  .route('/package/:packageId')
  .get(
    auth('getPackage'),
    validate(dailySavingsValidation.getDailySavingsPackageById),
    dailySavingsController.getDailySavingsPackageById
  )
  .patch(auth('updatePackage'), validate(dailySavingsValidation.updatedPackage), dailySavingsController.updatePackage);

/**
 * Route for initializing payment for daily savings contribution
 */
router
  .route('/init-contribution')
  .post(
    auth('selfAccount'),
    validate(dailySavingsValidation.initializeDailySavingsContribution),
    dailySavingsController.initializeDailySavingsContribution
  );

module.exports = router;
