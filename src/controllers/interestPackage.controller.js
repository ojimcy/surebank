const httpStatus = require('http-status');
const { interestPackageService, paymentService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const interestRateConfig = require('../config/interestRates');
const config = require('../config/config');
const logger = require('../config/logger');
/**
 * Initiate payment for a new interest-based savings package
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initiateInterestPackagePayment = catchAsync(async (req, res) => {
  const packageData = req.body;
  const userId = req.user._id;

  const paymentResponse = await paymentService.initiateInterestPackagePayment({
    ...packageData,
    userId,
  });

  res.status(httpStatus.OK).json(paymentResponse);
});

/**
 * Create a new interest-based savings package after payment verification
 * This is used for both webhook callbacks and admin-initiated package creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createInterestPackage = catchAsync(async (req, res) => {
  const packageData = req.body;
  const userId = req.user._id;
  const createdBy = userId;

  // Check user role for admin privileges
  const isAdminCreated = req.user.role === 'admin';

  // Check if payment reference is provided in query params or body
  const reference = req.query.reference || req.body.paymentReference;

  // If user is not admin and no payment reference, reject creation
  if (!isAdminCreated && !reference) {
    return res.status(httpStatus.PAYMENT_REQUIRED).json({
      success: false,
      message: 'Payment is required before creating an interest package. Please use the init-payment endpoint first.',
    });
  }

  try {
    const createdPackage = await interestPackageService.createInterestPackage(
      {
        ...packageData,
        userId,
        createdBy,
        isAdminCreated,
      },
      reference
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Interest package created successfully',
      data: createdPackage,
    });
  } catch (error) {
    if (error.statusCode === httpStatus.PAYMENT_REQUIRED) {
      return res.status(httpStatus.PAYMENT_REQUIRED).json({
        success: false,
        message: error.message,
      });
    }
    throw error; // Let the global error handler handle other errors
  }
});

/**
 * Get interest package by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInterestPackageById = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const interestPackage = await interestPackageService.getInterestPackageById(packageId);

  res.status(httpStatus.OK).json(interestPackage);
});

/**
 * Get interest package by payment reference
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInterestPackageByReference = catchAsync(async (req, res) => {
  const { reference } = req.query;
  const interestPackage = await interestPackageService.getInterestPackageByReference(reference);

  res.status(httpStatus.OK).json(interestPackage);
});

/**
 * Get all interest packages for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserInterestPackages = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const packages = await interestPackageService.getUserInterestPackages(userId);

  res.status(httpStatus.OK).json(packages);
});

/**
 * Calculate early withdrawal details for a package
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateEarlyWithdrawal = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const withdrawalDetails = await interestPackageService.calculateEarlyWithdrawalAmount(packageId);

  res.status(httpStatus.OK).json(withdrawalDetails);
});

/**
 * Request a withdrawal from an interest package
 * Intelligently handles both early and mature withdrawals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const requestWithdrawal = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const { withdrawalReason } = req.body;
  const userId = req.user._id;

  const withdrawalResult = await interestPackageService.requestWithdrawal(packageId, withdrawalReason, userId);

  res.status(httpStatus.OK).json(withdrawalResult);
});

/**
 * Get projected interest for a package
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectedInterest = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const { days } = req.query;

  const projectionDays = days ? parseInt(days, 10) : 30; // Default to 30 days projection

  const projectionDetails = await interestPackageService.getProjectedInterest(packageId, projectionDays);

  res.status(httpStatus.OK).json(projectionDetails);
});

/**
 * Handle webhook callback from Paystack for interest package creation
 * This endpoint doesn't require authentication as it's called by Paystack
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePaymentCallback = catchAsync(async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Payment reference is required',
    });
  }

  try {
    const result = await interestPackageService.processVerifiedPayment({ reference });
    logger.info(`processing payment: ${result}`);
    // If it's a web callback (not webhook), redirect to success page with package details
    if (req.headers['user-agent'] && !req.headers['x-paystack-signature']) {
      // Build the redirect URL with the package details
      let finalRedirectURL = `${config.paystack.frontendUrl}/packages/new/ibs-success?reference=${result.reference}&status=success`;

      // If the result has a redirect_url, use that instead
      if (result.redirect_url) {
        finalRedirectURL = result.redirect_url;

        // Add query parameters if not already present
        if (!finalRedirectURL.includes('?')) {
          finalRedirectURL += `?reference=${result.reference}&status=success`;
        } else {
          finalRedirectURL += `&reference=${result.reference}&status=success`;
        }
      }

      return res.redirect(finalRedirectURL);
    }

    // Otherwise return JSON for API/webhook consumers
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment verified and package created successfully',
      data: result,
    });
  } catch (error) {
    // If it's a web callback, redirect to error page
    if (req.headers['user-agent'] && !req.headers['x-paystack-signature']) {
      return res.redirect(`/error?message=${encodeURIComponent(error.message)}&status=failed`);
    }

    // Otherwise return JSON error
    return res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to process payment',
    });
  }
});

/**
 * Get available interest rate options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} HTTP response
 */
const getInterestRateOptions = catchAsync(async (req, res) => {
  const interestRateOptions = interestRateConfig.getAllowedInterestRates();
  res.send(interestRateOptions);
});

module.exports = {
  initiateInterestPackagePayment,
  createInterestPackage,
  getInterestPackageById,
  getInterestPackageByReference,
  getUserInterestPackages,
  calculateEarlyWithdrawal,
  requestWithdrawal,
  getProjectedInterest,
  handlePaymentCallback,
  getInterestRateOptions,
};
