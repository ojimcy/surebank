const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { accountingService, expenditureService } = require('../services');

const createExpenditure = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const date = new Date().getTime();
  const createdBy = req.user._id;

  // Create the expenditure using the expenditure service
  const createdExpenditure = await expenditureService.createExpenditure({
    date,
    amount,
    reason,
    createdBy,
    status: 'pending',
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
  const paginatedExpenditures = await expenditureService.getExpendituresByDateRange(startDate, endDate, page, limit);

  res.status(httpStatus.OK).send(paginatedExpenditures);
});

const getTotalExpenditure = catchAsync(async (req, res) => {
  const totalExpenditure = await expenditureService.getTotalExpenditure();
  res.status(httpStatus.OK).json(totalExpenditure);
});

const getBranchTotalExpenditure = catchAsync(async (req, res) => {
  const branchAdmin = req.user._id;
  const totalExpenditure = await expenditureService.getBranchTotalExpenditure(branchAdmin);
  res.status(httpStatus.OK).json(totalExpenditure);
});

const getExpenditureById = catchAsync(async (req, res) => {
  const { expenditureId } = req.params;

  // Call the service function to get the single expenditure by its ID
  const expenditure = await expenditureService.getExpenditureById(expenditureId);

  if (!expenditure) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Expenditure not found' });
  }

  res.status(httpStatus.OK).send(expenditure);
});

const updateExpenditure = catchAsync(async (req, res) => {
  const expenditure = await expenditureService.updateExpenditure(req.params.expenditureId, req.body);
  res.status(httpStatus.NO_CONTENT).send(expenditure);
});

const deleteExpenditure = catchAsync(async (req, res) => {
  await accountingService.deleteExpenditure(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getExpendituresByUserReps = catchAsync(async (req, res) => {
  const userRepsId = req.user._id;
  const { page, limit } = req.query;
  const paginatedExpenditures = await expenditureService.getExpendituresByUserReps(userRepsId, page, limit);
  res.status(httpStatus.OK).send(paginatedExpenditures);
});

const approveExpenditure = catchAsync(async (req, res) => {
  const { expenditureId } = req.params;
  const approvedBy = req.user._id;

  const updatedExpenditure = await expenditureService.approveExpenditure(expenditureId, approvedBy);

  res.status(httpStatus.OK).send(updatedExpenditure);
});

const rejectExpenditure = catchAsync(async (req, res) => {
  const { expenditureId } = req.params;
  const rejectedBy = req.user._id;
  const { reasonForRejection } = req.body;

  const updatedExpenditure = await expenditureService.rejectExpenditure(expenditureId, rejectedBy, reasonForRejection);

  res.status(httpStatus.OK).send(updatedExpenditure);
});

module.exports = {
  createExpenditure,
  getExpendituresByDateRange,
  getTotalExpenditure,
  getBranchTotalExpenditure,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getExpendituresByUserReps,
  approveExpenditure,
  rejectExpenditure,
};
