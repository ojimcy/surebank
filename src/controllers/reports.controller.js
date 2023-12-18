const httpStatus = require('http-status');
const pick = require('../utils/pick');
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

const getTotalContributionsByUserReps = catchAsync(async (req, res) => {
  const { createdBy } = req.params;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getTotalContributionsByUserReps(createdBy, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getMyTotalContributions = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getMyTotalContributions(createdBy, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getMyDsWithdrawals = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  const { startDate, endDateParam } = req.query;
  const totalWithdrawals = await reportService.getMyDsWithdrawals(createdBy, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalWithdrawals);
});

const getContributionsByDayForBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { startDate, endDateParam } = req.query;
  const totalContributions = await reportService.getContributionsByDayForBranch(branchId, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalContributions);
});

const getChargedPackages = catchAsync(async (req, res) => {
  const chargedPackages = await reportService.getChargedPackages();
  res.status(httpStatus.OK).json(chargedPackages);
});

const getChargedSbPackages = catchAsync(async (req, res) => {
  const chargedPackages = await reportService.getChargedSbPackages();
  res.status(httpStatus.OK).json(chargedPackages);
});

const getCharges = catchAsync(async (req, res) => {
  const { startDate, endDate, branchId } = req.query;

  const filterOptions = {
    startDate,
    endDate,
    branchId,
  };

  const options = {
    limit: req.query.limit || 100,
    page: req.query.page || 1,
    sortBy: req.query.sortBy,
  };

  const charges = await reportService.getCharges(filterOptions, options);

  res.status(httpStatus.OK).json(charges);
});

const getSumOfFirstContributions = catchAsync(async (req, res) => {
  const { branchId } = req.query;

  const totalCharge = await reportService.getSumOfFirstContributions(branchId);

  res.status(httpStatus.OK).json(totalCharge);
});

const getPackages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'userReps', 'branchId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await reportService.getPackages(filter, options);
  res.send(result);
});

module.exports = {
  getTotalContributions,
  getDailySavingsWithdrawals,
  getTotalContributionsByUserReps,
  getMyTotalContributions,
  getMyDsWithdrawals,
  getContributionsByDayForBranch,
  getChargedPackages,
  getChargedSbPackages,
  getCharges,
  getSumOfFirstContributions,
  getPackages,
};
