const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const interestPackageValidation = require('../../validations/interestPackage.validation');
const interestPackageController = require('../../controllers/interestPackage.controller');

const router = express.Router();

// Initiate payment for a new interest package
router
  .route('/package/init-payment')
  .post(
    auth('selfAccount'),
    validate(interestPackageValidation.initiateInterestPackagePayment),
    interestPackageController.initiateInterestPackagePayment
  );

// Payment callback route - no auth required as it's called by Paystack
router.route('/payment/callback').get(interestPackageController.handlePaymentCallback);

router
  .route('/package')
  .post(
    auth('selfAccount'),
    validate(interestPackageValidation.createInterestPackage),
    interestPackageController.createInterestPackage
  )
  .get(
    auth('userPackage'),
    validate(interestPackageValidation.getUserInterestPackages),
    interestPackageController.getUserInterestPackages
  );

// Get package by payment reference
router
  .route('/package/reference')
  .get(
    auth('selfAccount'),
    validate(interestPackageValidation.getInterestPackageByReference),
    interestPackageController.getInterestPackageByReference
  );

router
  .route('/package/:packageId')
  .get(
    auth('selfAccount'),
    validate(interestPackageValidation.getInterestPackageById),
    interestPackageController.getInterestPackageById
  );

// endpoint to request withdrawal (handles both early and mature withdrawals)
router
  .route('/package/:packageId/request-withdrawal')
  .post(
    auth('selfAccount'),
    validate(interestPackageValidation.requestInterestPackageWithdrawal),
    interestPackageController.requestInterestPackageWithdrawal
  );

// endpoint for projected interest calculation
router
  .route('/package/:packageId/projected-interest')
  .get(
    auth('selfAccount'),
    validate(interestPackageValidation.getProjectedInterest),
    interestPackageController.getProjectedInterest
  );

/**
 * GET /v1/interest-packages/rate-options - Get available interest rate options
 */
router.route('/rate-options').get(auth(), interestPackageController.getInterestRateOptions);

module.exports = router;
