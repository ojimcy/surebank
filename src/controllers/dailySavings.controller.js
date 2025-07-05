const httpStatus = require('http-status');
const { dailySavingsService, paymentService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createDailySavingsPackage = catchAsync(async (req, res) => {
  const dailyInput = req.body;
  const startDate = new Date().getTime();
  const createdBy = req.user._id;
  const totalContribution = 0;
  const status = 'open';
  const createdPackage = await dailySavingsService.createDailySavingsPackage({
    ...dailyInput,
    startDate,
    createdBy,
    totalContribution,
    status,
  });
  res.status(httpStatus.OK).json(createdPackage);
});

const createUserInitiatedDailySavingsPackage = catchAsync(async (req, res) => {
  const dailyInput = req.body;
  const startDate = new Date().getTime();
  const createdBy = req.user._id;
  const userId = req.user._id;
  const totalContribution = 0;
  const status = 'open';

  const createdPackage = await dailySavingsService.createUserInitiatedDailySavingsPackage({
    ...dailyInput,
    startDate,
    createdBy,
    userId,
    totalContribution,
    status,
  });

  res.status(httpStatus.CREATED).json(createdPackage);
});

const saveDailyContribution = catchAsync(async (req, res) => {
  const contributionInput = req.body;
  const createdBy = req.user._id;
  const packageId = req.query;
  const result = await dailySavingsService.saveDailyContribution({ ...contributionInput, createdBy, packageId });
  res.status(httpStatus.OK).json(result);
});

const makeDailySavingsTransfer = catchAsync(async (req, res) => {
  const transfer = req.body;
  const createdBy = req.user._id;
  const packageId = req.query;
  const transferDetails = await dailySavingsService.makeDailySavingsTransfer({ ...transfer, createdBy, packageId });
  res.status(httpStatus.OK).json(transferDetails);
});

const getDailySavingsPackageById = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const userPackage = await dailySavingsService.getDailySavingsPackageById(packageId);
  res.status(httpStatus.OK).send(userPackage);
});

const getUserDailySavingsPackages = catchAsync(async (req, res) => {
  let userId;
  // If a userId is provided in the query and the user is an admin, use that userId
  if (req.query.userId && ['admin', 'superAdmin', 'manager', 'userReps'].includes(req.user.role)) {
    userId = req.query.userId;
  } else {
    // Otherwise, use the authenticated user's id
    userId = req.user._id;
  }
  const userPackage = await dailySavingsService.getUserDailySavingsPackages(userId);

  if (!userPackage) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'User does not have an active daily savings package' });
  }
  res.status(httpStatus.OK).json(userPackage);
});

const updatePackage = catchAsync(async (req, res) => {
  const dsPackage = await dailySavingsService.updatePackageById(req.params.packageId, req.body);
  res.send(dsPackage);
});

/**
 * Initialize a Paystack payment for daily savings contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initializeDailySavingsContribution = catchAsync(async (req, res) => {
  const { packageId, amount } = req.body;
  const userId = req.user._id;

  // Initialize payment through payment service
  const paymentResponse = await paymentService.initializeDailySavingsContribution({
    packageId,
    amount,
    userId,
  });

  res.status(httpStatus.OK).json(paymentResponse);
});

module.exports = {
  createDailySavingsPackage,
  createUserInitiatedDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsTransfer,
  getUserDailySavingsPackages,
  getDailySavingsPackageById,
  updatePackage,
  initializeDailySavingsContribution,
};
