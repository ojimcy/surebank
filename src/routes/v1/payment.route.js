const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const paymentValidation = require('../../validations/payment.validation');
const { userPortalController } = require('../../controllers');

const router = express.Router();

// User routes - authenticated
router.post(
  '/ds/contribute/init',
  auth('initiateDsContribution'),
  validate(paymentValidation.initializeDsContribution),
  userPortalController.initializeDailySavingsContribution
);

router.get('/ds/packages', auth('userPackage'), userPortalController.getUserDailySavingsPackages);

router.get('/ds/packages/:packageId/contributions', auth('userPackage'), userPortalController.getPackageContributions);

// Webhook/callback handlers - typically not authenticated but might require verification
router.post('/verify', validate(paymentValidation.verifyPayment), userPortalController.handleDailySavingsContribution);

// Future payment-related routes can be added here
// router.post('/sb/contribute/init', ...);
// router.get('/transactions', ...);

module.exports = router;
