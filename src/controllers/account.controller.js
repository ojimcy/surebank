const httpStatus = require('http-status');
const { accountService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createAccount = catchAsync(async (req, res) => {
  const createdBy = req.user._id;
  const account = await accountService.createAccount({ ...req.body }, createdBy);
  res.status(httpStatus.CREATED).send(account);
});

const assignBranch = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { branchId } = req.body;
  const account = await accountService.assignBranch(accountId, branchId);
  res.status(httpStatus.OK).send(account);
});

const assignManager = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { managerId } = req.body;
  const account = await accountService.assignManager(accountId, managerId);
  res.status(httpStatus.OK).send(account);
});

const getUserAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const account = await accountService.getUserAccount(userId);
  res.status(httpStatus.OK).send(account);
});

const getAllAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'accountNumber']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await accountService.getAllAccounts(filter, options);
  res.send(result);
});

const deleteAccount = catchAsync(async (req, res) => {
  await accountService.deleteAccount(req.params.userId);
  res.status(httpStatus.OK).status(httpStatus.NO_CONTENT).send();
});

const updateAccount = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const account = await accountService.updateAccount(accountId, req.body);
  res.status(httpStatus.OK).json(account);
});

const getAccount = catchAsync(async (req, res) => {
  const account = await accountService.getAccountById(req.params.accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Accountnot found');
  }
  res.send(account);
});

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  getUserAccount,
  getAllAccounts,
  deleteAccount,
  updateAccount,
  getAccount,
};
