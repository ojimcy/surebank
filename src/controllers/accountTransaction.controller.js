const httpStatus = require('http-status');
const { accountTransactionService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getUserByAccountNumber = catchAsync(async (req, res) => {
  const { accountNumber } = req.params;

  const result = await accountTransactionService.getUserByAccountNumber(accountNumber);

  if (result.success) {
    res.status(httpStatus.OK).json(result.data);
  } else {
    res.status(httpStatus.NOT_FOUND).json({
      error: {
        message: result.message,
      },
    });
  }
});

const makeCustomerDeposit = catchAsync(async (req, res) => {
  const depositInput = req.body;
  const operatorId = req.user._id;
  const result = await accountTransactionService.makeCustomerDeposit({ ...depositInput, operatorId });
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
  const depositInput = req.body;
  const operatorId = req.user._id;
  const result = await accountTransactionService.makeCustomerWithdrawal({ ...depositInput, operatorId });
  res.status(httpStatus.OK).json(result);
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
};
