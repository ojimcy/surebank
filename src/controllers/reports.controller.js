const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { reportService } = require('../services');

const getTotalContributions = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getTotalContributionsByDay(startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});
const getBranchTotalContributions = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const branchAdmin = req.user._id;
  const totalContributions = await reportService.getBranchTotalContributionsByDay(startDate, endDateParam, branchAdmin);
  res.status(httpStatus.OK).json(totalContributions);
});

const getDailySavingsWithdrawals = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const totalWithdrawals = await reportService.getTotalDailySavingsWithdrawal(startDate, endDateParam);
  res.status(httpStatus.OK).json(totalWithdrawals);
});
const getBranchDailySavingsWithdrawals = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const branchAdmin = req.user._id;
  const totalWithdrawals = await reportService.getBranchTotalDailySavingsWithdrawal(startDate, endDateParam, branchAdmin);
  res.status(httpStatus.OK).json(totalWithdrawals);
});

const getPackageReport = catchAsync(async (req, res) => {
  const branchAdmin = req.user._id;
  const totalPackages = await reportService.getTotalPackages();
  const totalOpenPackages = await reportService.getTotalOpenPackages();
  const totalBranchOpenPackages = await reportService.getBranchTotalOpenPackages(branchAdmin);
  const totalClosedPackages = await reportService.getTotalClosedPackages();
  const totalBranchClosedPackages = await reportService.getBranchTotalClosedPackages(branchAdmin);

  res.status(httpStatus.OK).json({
    totalPackages,
    totalOpenPackages,
    totalBranchOpenPackages,
    totalClosedPackages,
    totalBranchClosedPackages,
  });
});

const getTotalContributionsByUserReps = catchAsync(async (req, res) => {
  const { userReps } = req.params;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getTotalContributionsByUserReps(userReps, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

module.exports = {
  getTotalContributions,
  getBranchTotalContributions,
  getDailySavingsWithdrawals,
  getBranchDailySavingsWithdrawals,
  getPackageReport,
  getTotalContributionsByUserReps,
};
