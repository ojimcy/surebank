const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { accountingService } = require('../services');

const ledgerEntry = catchAsync(async (req, res, next) => {
  const now = new Date();
  const date = new Date(now).getTime();
  const addLedgerEntryInput = { ...req.body, date };
  const addEntryInput = await accountingService.addLedgerEntry(addLedgerEntryInput);
  if (addEntryInput.error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, addEntryInput.error));
  }
  res.status(httpStatus.NO_CONTENT).send(addEntryInput);
});

const getLedgerEntries = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, ['userId', 'branchId']);
  const options = {
    sortBy: 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };

  const result = await accountingService.getLedgerEntries(filter, options);
  if (result.error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, result.error));
  }
  res.status(httpStatus.NO_CONTENT).send(result);
});

const computeDailySummary = catchAsync(async (req, res, next) => {
  const { date } = req.body;
  const getDailySummary = await accountingService.computeDailySummary(date);

  if (getDailySummary.error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, getDailySummary.error));
  }
  res.status(httpStatus.NO_CONTENT).send(getDailySummary);
});

const getDailySummary = catchAsync(async (req, res, next) => {
  const filter = pick(req.query, ['date']);
  const options = {
    sortBy: 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };

  const result = await accountingService.getDailySummary(filter, options);
  if (result.error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, result.error));
  }
  res.status(httpStatus.NO_CONTENT).send(result);
});

const createExpenditure = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const date = new Date().getTime();
  const userReps = req.user._id;
  const branchAdmin = req.user._id;

  // Create the expenditure using the expenditure service
  const createdExpenditure = await accountingService.createExpenditure({
    date,
    amount,
    reason,
    userReps,
    branchAdmin,
  });

  res.status(httpStatus.CREATED).send(createdExpenditure);
});

const getExpendituresByDateRange = catchAsync(async (req, res) => {
  // Extract start and end date from the request query
  const { startDate, endDate } = req.query;

  // Extract page and limit for pagination from the request query
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Call the service function to get paginated expenditures within the date range
  const paginatedExpenditures = await accountingService.getExpendituresByDateRange(startDate, endDate, page, limit);

  res.status(httpStatus.OK).send(paginatedExpenditures);
});

const getTotalExpenditure = catchAsync(async (req, res) => {
  const totalExpenditure = await accountingService.getTotalExpenditure();
  res.status(httpStatus.OK).json(totalExpenditure);
});
const getBranchTotalExpenditure = catchAsync(async (req, res) => {
  const branchAdmin = req.user._id;
  const totalExpenditure = await accountingService.getBranchTotalExpenditure(branchAdmin);
  res.status(httpStatus.OK).json(totalExpenditure);
});

const getExpenditureById = catchAsync(async (req, res) => {
  const { expenditureId } = req.params;

  // Call the service function to get the single expenditure by its ID
  const expenditure = await accountingService.getExpenditureById(expenditureId);

  if (!expenditure) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Expenditure not found' });
  }

  res.status(httpStatus.OK).send(expenditure);
});

const updateExpenditure = catchAsync(async (req, res) => {
  const expenditure = await accountingService.updateExpenditure(req.params.expenditureId, req.body);
  res.status(httpStatus.NO_CONTENT).send(expenditure);
});

const deleteExpenditure = catchAsync(async (req, res) => {
  await accountingService.deleteExpenditure(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSumOfFirstContributions = catchAsync(async (req, res) => {
  const result = await accountingService.getSumOfFirstContributions();
  res.status(httpStatus.OK).json(result);
});
const getBranchSumOfFirstContributions = catchAsync(async (req, res) => {
  const branchAdmin = req.user._id;
  const result = await accountingService.getBranchSumOfFirstContributions(branchAdmin);
  res.status(httpStatus.OK).json(result);
});

const getExpendituresByUserReps = catchAsync(async (req, res) => {
  const userRepsId = req.user._id;
  const { page, limit } = req.query;
  const paginatedExpenditures = await accountingService.getExpendituresByUserReps(userRepsId, page, limit);
  res.status(httpStatus.OK).send(paginatedExpenditures);
});

module.exports = {
  ledgerEntry,
  getLedgerEntries,
  computeDailySummary,
  getDailySummary,
  createExpenditure,
  getExpendituresByDateRange,
  getTotalExpenditure,
  getBranchTotalExpenditure,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getSumOfFirstContributions,
  getExpendituresByUserReps,
  getBranchSumOfFirstContributions,
};
