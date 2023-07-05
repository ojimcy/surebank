const httpStatus = require('http-status');
const { accountService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createAccount = catchAsync(async (req, res) => {
  const { userId, accountType, branchId } = req.body;
  const createdBy = req.user._id;
  const account = await accountService.createAccount({ userId, accountType, branchId }, createdBy);
  res.status(httpStatus.CREATED).json(account);
});

const assignBranch = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { branchId } = req.body;
  const account = await accountService.assignBranch(accountId, branchId);
  res.status(httpStatus.OK).json(account);
});

const assignManager = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { managerId } = req.body;
  const account = await accountService.assignManager(accountId, managerId);
  res.status(httpStatus.OK).json(account);
});

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
};
