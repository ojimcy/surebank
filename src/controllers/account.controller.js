const httpStatus = require('http-status');
const { accountService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

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
  const { accountType } = req.query;
  const account = await accountService.getUserAccount(userId, accountType);
  res.status(httpStatus.OK).send(account);
});

const getUserAccounts = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const account = await accountService.getUserAccounts(userId);
  res.status(httpStatus.OK).send(account);
});

const getAllAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['branchId', 'accountManagerId', 'accountType', 'accountNumber']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await accountService.getAllAccounts(filter, options);
  res.send(result);
});

const getAccountInBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;

  // Pick relevant options
  const filter = pick(req.query, ['staffId', 'isCurrent']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  options.limit = parseInt(options.limit, 10) || 20;
  options.page = parseInt(options.page, 10) || 1;

  const branchCustomerAccounts = await accountService.getAccountsInBranch(branchId, filter, options);

  res.send(branchCustomerAccounts);
});

const getAccountsByStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;

  // Pick relevant options
  const filter = pick(req.query, ['staffId', 'isCurrent']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  options.limit = parseInt(options.limit, 10) || 20;
  options.page = parseInt(options.page, 10) || 1;

  const staffCustomerAccounts = await accountService.getAccountsByStaff(staffId, filter, options);

  res.status(httpStatus.OK).send(staffCustomerAccounts);
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

const createSelfAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const account = await accountService.createSelfAccount(userId, req.body.accountType);
  res.status(httpStatus.CREATED).send(account);
});

const getSelfAccount = catchAsync(async (req, res) => {
  logger.info('req.user', req.user);
  const userId = req.user._id;
  const account = await accountService.getUserAccount(userId, req.query.accountType);
  res.status(httpStatus.OK).send(account);
});

const updateAccountBvn = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const { bvn } = req.body;

  const account = await accountService.updateAccountBvn(accountId, bvn);
  res.status(httpStatus.OK).send(account);
});

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  getUserAccount,
  getUserAccounts,
  getAllAccounts,
  getAccountInBranch,
  getAccountsByStaff,
  deleteAccount,
  updateAccount,
  getAccount,
  createSelfAccount,
  getSelfAccount,
  updateAccountBvn,
};
