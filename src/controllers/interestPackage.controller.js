const httpStatus = require('http-status');
const { interestPackageService, paymentService } = require('../services');
const catchAsync = require('../utils/catchAsync');

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

  // For admin users, allow direct creation without payment
  const isAdminCreated = req.user.role === 'admin';

  // Check if this is a verification callback
  const { reference } = req.query;

  const createdPackage = await interestPackageService.createInterestPackage(
    {
      ...packageData,
      userId,
      createdBy,
      isAdminCreated,
    },
    reference
  );

  res.status(httpStatus.CREATED).json(createdPackage);
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
      message: 'Payment reference is required',
    });
  }

  const result = await interestPackageService.processVerifiedPayment({ reference });

  res.status(httpStatus.OK).json(result);
});

module.exports = {
  initiateInterestPackagePayment,
  createInterestPackage,
  getInterestPackageById,
  getUserInterestPackages,
  calculateEarlyWithdrawal,
  requestWithdrawal,
  getProjectedInterest,
  handlePaymentCallback,
};
