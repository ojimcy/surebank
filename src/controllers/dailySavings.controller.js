const httpStatus = require('http-status');
const { dailySavingsService } = require('../services');
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

const saveDailyContribution = catchAsync(async (req, res) => {
  const contributionInput = req.body;
  const userReps = req.user._id;
  const packageId = req.query;
  const result = await dailySavingsService.saveDailyContribution({ ...contributionInput, userReps, packageId });
  res.status(httpStatus.OK).json(result);
});

const makeDailySavingsWithdrawal = catchAsync(async (req, res) => {
  const withdrawal = req.body;
  const userReps = req.user._id;
  const packageId = req.query;
  const withdrawalDetails = await dailySavingsService.makeDailySavingsWithdrawal({ ...withdrawal, userReps, packageId });
  res.status(httpStatus.OK).json(withdrawalDetails);
});

const getDailySavingsPackageById = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const userPackage = await dailySavingsService.getDailySavingsPackageById(packageId);
  res.status(httpStatus.OK).send(userPackage);
});

const getUserDailySavingsPackages = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const userPackage = await dailySavingsService.getUserDailySavingsPackages(userId);

  if (!userPackage) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'User does not have an active daily savings package' });
  }
  res.status(httpStatus.OK).json(userPackage);
});

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackages,
  getDailySavingsPackageById,
};
