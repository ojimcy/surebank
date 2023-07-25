const httpStatus = require('http-status');
const { dailySavingsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createDailySavingsPackage = catchAsync(async (req, res) => {
  const dailyInput = req.body;
  const startDate = new Date().getTime();
  const userReps = req.user._id;
  const totalContribution = 0;
  const status = 'open';
  const createdPackage = await dailySavingsService.createDailySavingsPackage({
    ...dailyInput,
    startDate,
    userReps,
    totalContribution,
    status,
  });
  res.status(httpStatus.OK).send(createdPackage);
});

const saveDailyContribution = catchAsync(async (req, res) => {
  const contributionInput = req.body;
  const userReps = req.user._id;
  const branchId = req.query;
  const result = await dailySavingsService.saveDailyContribution({ ...contributionInput, userReps, branchId });
  res.status(httpStatus.OK).json(result);
});

const makeDailySavingsWithdrawal = catchAsync(async (req, res) => {
  const withdrawal = req.body;
  const userReps = req.user._id;
  const withdrawalDetails = await dailySavingsService.makeDailySavingsWithdrawal({ ...withdrawal, userReps });
  res.status(httpStatus.OK).json(withdrawalDetails);
});

const getUserDailySavingsPackage = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const userPackage = await dailySavingsService.getUserDailySavingsPackage(userId);

  if (!userPackage) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'User does not have an active daily savings package' });
  }

  res.status(httpStatus.OK).json(userPackage);
});

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackage,
};
