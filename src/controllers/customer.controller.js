const httpStatus = require('http-status');
const { customerService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCustomer = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  // Convert the branchName to lowercase before passing it to createCustomer
  const { branchName, ...customerData } = req.body;
  const lowerCaseBranchName = branchName.toLowerCase();

  const { user, account } = await customerService.createCustomer(
    { ...customerData, branchName: lowerCaseBranchName },
    createdBy
  );
  res.status(httpStatus.CREATED).json({ user, account });
});

// customer transactions

const makeDeposit = catchAsync(async (req, res) => {
  const depositInput = req.body;
  const operatorId = req.user._id;
  const result = await customerService.makeDeposit({ ...depositInput, operatorId });
  res.status(httpStatus.OK).json(result);
});

const makeWithdrawal = catchAsync(async (req, res) => {
  const withdrawalInput = req.body;
  const operatorId = req.user._id;
  const userId = req.user._id.toString();
  const result = await customerService.makeWithdrawal(withdrawalInput, userId, operatorId);
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createCustomer,
  makeDeposit,
  makeWithdrawal,
};
