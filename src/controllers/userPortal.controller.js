const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService, dailySavingsService, sbPackageService } = require('../services');

/**
 * Initialize a contribution to a Daily Savings package via Paystack
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const initializeDailySavingsContribution = catchAsync(async (req, res) => {
  // Ensure userId is the authenticated user
  const contributionData = {
    ...req.body,
    userId: req.user._id, // Override userId with authenticated user ID for security
  };

  const result = await paymentService.initializeDailySavingsContribution(contributionData);
  res.status(httpStatus.OK).json(result);
});

/**
 * Initialize a contribution to a Savings-Buying package via Paystack
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const initializeSbContribution = catchAsync(async (req, res) => {
  // Ensure userId is the authenticated user
  const contributionData = {
    ...req.body,
    userId: req.user._id, // Override userId with authenticated user ID for security
  };

  const result = await paymentService.initializeSbContribution(contributionData);
  res.status(httpStatus.OK).json(result);
});

/**
 * Handle a callback from Paystack for Daily Savings contribution
 * This is typically called by a webhook or redirect from Paystack
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const handleDailySavingsContribution = catchAsync(async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Transaction reference is required',
    });
  }

  const result = await paymentService.verifyTransaction(reference);
  res.status(httpStatus.OK).json(result);
});

/**
 * Get all Daily Savings packages for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getUserDailySavingsPackages = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userPackages = await dailySavingsService.getUserDailySavingsPackages(userId);

  res.status(httpStatus.OK).json(userPackages);
});

/**
 * Get contributions for a specific package owned by the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPackageContributions = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const { startDate, endDate } = req.query;

  // Create filters object for date filtering
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Try to find the package in DS packages first
  let packageData;

  try {
    packageData = await dailySavingsService.getDailySavingsPackageById(packageId);
  } catch (error) {
    // Package doesn't exist in DS, try SB
    if (error.statusCode === 404) {
      try {
        packageData = await sbPackageService.getPackageById(packageId);
      } catch (sbError) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Package not found',
        });
      }
    } else {
      throw error; // Rethrow if it's not a 404 error
    }
  }

  // If no package found in either service
  if (!packageData) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Package not found',
    });
  }

  // Verify ownership
  if (packageData.userId.toString() !== req.user._id.toString()) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to view this package',
    });
  }

  // Get contributions - works for both DS and SB since they share the same Contribution model
  const contributions = await dailySavingsService.getDailySavingsContributions(packageId, filters);

  // Return just the contributions to maintain backward compatibility
  res.status(httpStatus.OK).json(contributions);
});

module.exports = {
  initializeDailySavingsContribution,
  initializeSbContribution,
  handleDailySavingsContribution,
  getUserDailySavingsPackages,
  getPackageContributions,
};
