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
  res.send(addEntryInput);
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
  res.send(result);
});

const computeDailySummary = catchAsync(async (req, res, next) => {
  const { date } = req.body;
  const getDailySummary = await accountingService.computeDailySummary(date);

  if (getDailySummary.error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, getDailySummary.error));
  }
  res.send(getDailySummary);
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
  res.send(result);
});

const createExpenditure = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const date = new Date().getTime();
  const userReps = req.user._id;

  // Create the expenditure using the expenditure service
  const createdExpenditure = await accountingService.createExpenditure({
    date,
    amount,
    reason,
    userReps,
  });

  res.status(httpStatus.CREATED).json(createdExpenditure);
});

const getExpendituresByDateRange = catchAsync(async (req, res) => {
  // Extract start and end date from the request query
  const { startDate, endDate } = req.query;

  // Extract page and limit for pagination from the request query
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Call the service function to get paginated expenditures within the date range
  const paginatedExpenditures = await accountingService.getExpendituresByDateRange(startDate, endDate, page, limit);

  res.status(httpStatus.OK).json(paginatedExpenditures);
});

const getTotalExpenditure = catchAsync(async (req, res) => {
  const totalExpenditure = await accountingService.getTotalExpenditure();
  res.status(httpStatus.OK).json({ totalExpenditure });
});

const getExpenditureById = catchAsync(async (req, res) => {
  const { expenditureId } = req.params;

  // Call the service function to get the single expenditure by its ID
  const expenditure = await accountingService.getExpenditureById(expenditureId);

  if (!expenditure) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Expenditure not found' });
  }

  res.status(httpStatus.OK).json(expenditure);
});

const updateExpenditure = catchAsync(async (req, res) => {
  const expenditure = await accountingService.updateExpenditure(req.params.expenditureId, req.body);
  res.send(expenditure);
});

const deleteExpenditure = catchAsync(async (req, res) => {
  await accountingService.deleteExpenditure(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSumOfFirstContributions = catchAsync(async (req, res) => {
  const result = await accountingService.getSumOfFirstContributions();
  res.status(httpStatus.OK).json({ result });
});

module.exports = {
  ledgerEntry,
  getLedgerEntries,
  computeDailySummary,
  getDailySummary,
  createExpenditure,
  getExpendituresByDateRange,
  getTotalExpenditure,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getSumOfFirstContributions,
};
