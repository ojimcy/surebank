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

module.exports = {
  ledgerEntry,
  getLedgerEntries,
  computeDailySummary,
  getDailySummary,
};
