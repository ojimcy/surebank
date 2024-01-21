const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { reportService } = require('../services');

const getTotalContributions = catchAsync(async (req, res) => {
  const { startDate, endDate, branchId, createdBy } = req.query;

  const totalContributions = await reportService.getSumOfDailyContributionsByDate(startDate, endDate, branchId, createdBy);

  res.status(httpStatus.OK).json(totalContributions);
});

const getDailySavingsWithdrawals = catchAsync(async (req, res) => {
  const { startDate, endDateParam, branchId, createdBy } = req.query;
  const totalWithdrawals = await reportService.getTotalDailySavingsWithdrawal(startDate, endDateParam, branchId, createdBy);
  res.status(httpStatus.OK).json(totalWithdrawals);
});

const getMyDsWithdrawals = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  const { startDate, endDateParam } = req.query;
  const totalWithdrawals = await reportService.getMyDsWithdrawals(createdBy, startDate, endDateParam);
  res.status(httpStatus.OK).json(totalWithdrawals);
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

const getSumOfFirstDsContributions = catchAsync(async (req, res) => {
  const { branchId } = req.query;

  const totalCharge = await reportService.getSumOfFirstDsContributions(branchId);

  res.status(httpStatus.OK).json(totalCharge);
});

const getPackages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'userReps', 'branchId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await reportService.getPackages(filter, options);
  res.send(result);
});

const getSumOfDailyContributions = catchAsync(async (req, res) => {
  const { startDate, endDate, branchId, createdBy } = req.query;

  const dailyContributions = await reportService.getSumOfDailyContributionsByDate(startDate, endDate, branchId, createdBy);

  res.status(httpStatus.OK).sebd(dailyContributions);
});

const getOtherCharges = catchAsync(async (req, res) => {
  const filterOptions = pick(req.query, ['startDate', 'endDate', 'branchId']);

  const totalCharge = await reportService.getOtherCharges(filterOptions);

  res.status(httpStatus.OK).json(totalCharge);
});

module.exports = {
  getTotalContributions,
  getDailySavingsWithdrawals,
  getMyDsWithdrawals,
  getChargedPackages,
  getChargedSbPackages,
  getCharges,
  getSumOfFirstDsContributions,
  getPackages,
  getSumOfDailyContributions,
  getOtherCharges,
};
