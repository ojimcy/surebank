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
  const packageId = req.query;
  const result = await dailySavingsService.saveDailyContribution({ ...contributionInput, userReps, packageId });
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

const getUserSavingsActivities = catchAsync(async (req, res) => {
  const { userId, accountNumber } = req.query;

  // Fetch user's daily savings package
  const userPackage = await dailySavingsService.getUserDailySavingsPackage(userId);
  const narration = 'Daily contribution withdrawal';
  if (!userPackage) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'User does not have an active daily savings package' });
  }

  // Fetch all contributions and withdrawals for the user's package
  const contributions = await dailySavingsService.getDailySavingsContributions(userPackage._id);
  const withdrawals = await dailySavingsService.getDailySavingsWithdrawals(accountNumber, narration);

  // Combine contributions and withdrawals into a single array and sort by date
  const savingsActivities = [...contributions, ...withdrawals].sort((a, b) => b.date - a.date);

  res.status(httpStatus.OK).json(savingsActivities);
});

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackage,
  getUserSavingsActivities,
};
