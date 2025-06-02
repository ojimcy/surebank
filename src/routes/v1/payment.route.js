const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const paymentValidation = require('../../validations/payment.validation');
const { userPortalController, paymentController } = require('../../controllers');

const router = express.Router();

router.get('/ds/packages', auth('userPackage'), userPortalController.getUserDailySavingsPackages);

/**
 * POST /v1/payments/init-contribution
 * Universal payment initialization for all contribution types
 * @auth Required (selfAccount permission)
 * @body {string} contributionType - Type: 'daily_savings', 'savings_buying', 'interest_package'
 * @body {string} [packageId] - Package ID (required for daily_savings and savings_buying)
 * @body {number} amount - Amount to contribute
 * @body {string} [callbackUrl] - Optional callback URL
 * @body {string} [redirect_url] - Optional redirect URL
 * @body {string} [name] - Package name (required for interest_package)
 * @body {number} [principalAmount] - Principal amount (required for interest_package)
 * @body {number} [lockPeriod] - Lock period in days (required for interest_package)
 * @body {number} [earlyWithdrawalPenalty] - Early withdrawal penalty (optional for interest_package)
 * @body {number} [interestRate] - Interest rate (optional for interest_package)
 * @returns {Object} Payment initialization response with authorization URL
 */
router.post(
  '/init-contribution',
  auth('selfAccount'),
  validate(paymentValidation.initializeContribution),
  paymentController.initializeContribution
);

/**
 * GET /v1/payments/status/:reference
 * Get payment status by reference
 * @auth Required (selfAccount permission)
 * @param {string} reference - Payment reference to check
 * @returns {Object} Payment status details
 */
router.get(
  '/status/:reference',
  auth('selfAccount'),
  validate(paymentValidation.getPaymentStatus),
  paymentController.getPaymentStatus
);

/**
 * GET /v1/payments/packages/:packageId/contributions
 * Get contributions for a specific package (works for both DS and SB packages)
 * @param {string} packageId - Package ID (in route params)
 * @query {string} [startDate] - Optional start date for filtering (YYYY-MM-DD)
 * @query {string} [endDate] - Optional end date for filtering (YYYY-MM-DD)
 * @returns {Object} Object containing packageType (ds/sb) and contributions array
 */
router.get('/packages/:packageId/contributions', auth('userPackage'), userPortalController.getPackageContributions);

// Webhook/callback handlers - typically not authenticated but might require verification
router.post('/verify', validate(paymentValidation.verifyPayment), userPortalController.handleDailySavingsContribution);

/**
 * POST /v1/payments/withdrawal/request
 * Create a self-withdrawal request
 * @auth Required
 * @body {string} accountNumber - Account number
 * @body {number} amount - Amount to withdraw
 * @body {string} bankName - Bank name
 * @body {string} bankCode - Bank code
 * @body {string} bankAccountNumber - Bank account number
 * @body {string} bankAccountName - Bank account name
 * @body {string} [reason] - Reason for withdrawal (optional)
 * @returns {Object} Withdrawal request details
 */
router.post(
  '/withdrawal/request',
  auth('selfWithdrawal'),
  validate(paymentValidation.selfWithdrawalRequest),
  userPortalController.requestSelfWithdrawal
);

/**
 * GET /v1/payments/withdrawal/status/:id
 * Get status of a self-withdrawal request
 * @auth Required
 * @param {string} id - Withdrawal request ID
 * @returns {Object} Withdrawal request status and details
 */
router.get(
  '/withdrawal/status/:id',
  auth('getSelfWithdrawal'),
  validate(paymentValidation.getSelfWithdrawalStatus),
  userPortalController.getSelfWithdrawalStatus
);

// Paystack webhook for transfer events
router.post('/transfer/webhook', validate(paymentValidation.paystackWebhook), userPortalController.handleTransferWebhook);

/**
 * POST /v1/payments/withdrawal/process/:requestId
 * Process a self-withdrawal request after thorough account audit
 * @auth Required (Staff with processWithdrawal permission)
 * @param {string} requestId - Withdrawal request ID
 * @returns {Object} Processing result with transfer details
 */
router.post(
  '/withdrawal/process/:requestId',
  auth('processWithdrawal'),
  validate(paymentValidation.processSelfWithdrawal),
  userPortalController.processSelfWithdrawal
);

// Future payment-related routes can be added here
// router.get('/transactions', ...);

module.exports = router;
