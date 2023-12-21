const httpStatus = require('http-status');
const { accountTransactionService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getUserByAccountNumber = catchAsync(async (req, res) => {
  const { accountNumber } = req.query;

  const result = await accountTransactionService.getUserByAccountNumber(accountNumber);
  res.status(httpStatus.OK).json(result);
});

const makeCustomerDeposit = catchAsync(async (req, res) => {
  const depositInput = req.body;
  const createdBy = req.user._id;
  const result = await accountTransactionService.makeCustomerDeposit({ ...depositInput, createdBy });
  res.status(httpStatus.OK).json(result);
});

const updateAccountStatus = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { status } = req.body;
  const account = await accountTransactionService.updateAccountStatus(accountId, status);
  res.status(httpStatus.OK).json(account);
});

const putAmountOnHold = catchAsync(async (req, res) => {
  const { accountNumber, amount } = req.body;
  const updatedBalance = await accountTransactionService.putAmountOnHold(accountNumber, amount);

  res.status(httpStatus.OK).json(updatedBalance);
});

const spendHeldAmount = catchAsync(async (req, res) => {
  const { accountNumber, amount } = req.body;
  const updatedBalance = await accountTransactionService.spendHeldAmount(accountNumber, amount);
  res.status(httpStatus.OK).send(updatedBalance);
});

const moveHeldAmountToAvailable = catchAsync(async (req, res) => {
  const { accountNumber, amount } = req.body;
  const result = await accountTransactionService.moveHeldAmountToAvailable(accountNumber, amount);

  res.status(httpStatus.OK).json(result);
});

const getAvailableBalance = catchAsync(async (req, res) => {
  const { accountNumber } = req.body;
  const availableBalance = await accountTransactionService.getAvailableBalance(accountNumber);
  if (!availableBalance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  res.send({ availableBalance });
});

const getAccountBalance = catchAsync(async (req, res) => {
  const { accountNumber } = req.body;
  const accountBalance = await accountTransactionService.getAccountBalance(accountNumber);
  if (!accountBalance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  res.send({ accountBalance });
});

const makeCustomerWithdrawal = catchAsync(async (req, res) => {
  const { requestId } = req.query;
  const approvedBy = req.user._id;
  const result = await accountTransactionService.makeCustomerWithdrawal(requestId, approvedBy);
  res.status(httpStatus.OK).json(result);
});

const getAccountTransactions = catchAsync(async (req, res) => {
  const { accountNumber, userReps, narration, page = 1, limit = 10000 } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const transactions = await accountTransactionService.getAccountTransactions({
    accountNumber,
    userReps,
    narration,
    page: parsedPage,
    limit: parsedLimit,
  });

  res.status(httpStatus.OK).json(transactions);
});

const getCustomerwithdrawals = catchAsync(async (req, res) => {
  const { startDate, endDate, branchId, createdBy, approvedBy, narration } = req.query;
  const result = await accountTransactionService.getCustomerwithdrawals(
    startDate,
    endDate,
    branchId,
    createdBy,
    approvedBy,
    narration
  );
  res.status(httpStatus.OK).json(result);
});

const makeWithdrawalRequest = catchAsync(async (req, res) => {
  const { accountNumber, amount } = req.body;
  const createdBy = req.user._id;
  const result = await accountTransactionService.makeWithdrawalRequest(accountNumber, amount, createdBy);
  res.status(httpStatus.OK).json(result);
});

const rejectWithdrawalRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { narration } = req.body;
  const result = await accountTransactionService.rejectWithdrawalRequest(requestId, narration);
  res.status(httpStatus.OK).json(result);
});

const getAllWithdrawalRequests = catchAsync(async (req, res) => {
  const { startDate, endDate, branchId, createdBy, page = 1, limit = 20 } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const result = await accountTransactionService.getAllWithdrawalRequests(
    startDate,
    endDate,
    branchId,
    createdBy,
    parsedPage,
    parsedLimit
  );
  res.status(httpStatus.OK).json(result);
});

const getWithdrawalRequestById = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const cashRequest = await accountTransactionService.getWithdrawalRequestById(requestId);
  if (!cashRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cash request not found');
  }
  res.status(httpStatus.OK).json(cashRequest);
});

const getHeldAmount = catchAsync(async (req, res) => {
  const { accountNumber } = req.query;

  if (!accountNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account number is required');
  }

  const heldAmount = await accountTransactionService.getHeldAmount(accountNumber);

  res.status(httpStatus.OK).json(heldAmount);
});

module.exports = {
  makeCustomerDeposit,
  updateAccountStatus,
  putAmountOnHold,
  spendHeldAmount,
  moveHeldAmountToAvailable,
  getUserByAccountNumber,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getCustomerwithdrawals,
  makeWithdrawalRequest,
  rejectWithdrawalRequest,
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
  getHeldAmount,
};
