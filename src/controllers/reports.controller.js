const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { reportService } = require('../services');

const getTotalContributions = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const totalContributions = await reportService.getTotalContributionsByDay(startDate, endDate);
  res.status(httpStatus.OK).json(totalContributions);
});

const getDailySavingsWithdrawals = catchAsync(async (req, res) => {
  const totalWithdrawals = await reportService.getTotalDailySavingsWithdrawal();
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

module.exports = {
  getTotalContributions,
  getDailySavingsWithdrawals,
  getPackageReport,
};
