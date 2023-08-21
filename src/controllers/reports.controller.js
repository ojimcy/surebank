const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { reportService } = require('../services');

const getTotalContributions = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getTotalContributionsByDay(startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getDailySavingsWithdrawals = catchAsync(async (req, res) => {
  const { startDate, endDateParam } = req.query;
  const totalWithdrawals = await reportService.getTotalDailySavingsWithdrawal(startDate, endDateParam);
  res.status(httpStatus.OK).json(totalWithdrawals);
});

const getPackageReport = catchAsync(async (req, res) => {
  const totalPackages = await reportService.getTotalPackages();
  const totalOpenPackages = await reportService.getTotalOpenPackages();
  const totalClosedPackages = await reportService.getTotalClosedPackages();

  res.status(httpStatus.OK).json({
    totalPackages,
    totalOpenPackages,
    totalClosedPackages,
  });
});

const getTotalContributionsByUserReps = catchAsync(async (req, res) => {
  const { userReps } = req.params;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getTotalContributionsByUserReps(userReps, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getMyTotalContributions = catchAsync(async (req, res) => {
  const userReps = req.user._id;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getMyTotalContributions(userReps, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getMyDsWithdrawals = catchAsync(async (req, res) => {
  const userReps = req.user._id;
  const { startDate, endDateParam } = req.query;
  const totalWithdrawals = await reportService.getMyDsWithdrawals(userReps, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalWithdrawals);
});

const getPackageReportForUserRep = catchAsync(async (req, res) => {
  const totalOpenPackages = await reportService.getTotalOpenPackagesForUserReps();
  const totalClosedPackages = await reportService.getTotalClosedPackagesForUserReps();

  res.status(httpStatus.OK).json({
    totalOpenPackages,
    totalClosedPackages,
  });
});

module.exports = {
  getTotalContributions,
  getDailySavingsWithdrawals,
  getPackageReport,
  getTotalContributionsByUserReps,
  getMyTotalContributions,
  getMyDsWithdrawals,
  getPackageReportForUserRep,
};
