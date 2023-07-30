const httpStatus = require('http-status');
const { accountService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createAccount = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  const account = await accountService.createAccount({ ...req.body }, createdBy);
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

const getUserAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const account = await accountService.getUserAccount(userId);
  res.status(httpStatus.OK).json(account);
});

const getAllAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'accountNumber']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await accountService.getAllAccounts(filter, options);
  res.send(result);
});

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  getUserAccount,
  getAllAccounts,
};
