const httpStatus = require('http-status');
const { accountService } = require('../services');

const createAccount = async (req, res, next) => {
  try {
    const { userId, accountType, branchId } = req.body;
    const createdBy = req.user._id;
    const account = await accountService.createAccount({ userId, accountType, branchId }, createdBy);
    res.status(httpStatus.CREATED).json(account);
  } catch (error) {
    next(error);
  }
};

const assignBranch = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { branchId } = req.body;
    const account = await accountService.assignBranch(accountId, branchId);
    res.status(httpStatus.OK).json(account);
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { managerId } = req.body;

    const account = await accountService.assignManager(accountId, managerId);
    res.status(httpStatus.OK).json(account);
  } catch (error) {
    next(error);
  }
};

const updateAccountStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { status } = req.body;

    const account = await accountService.updateAccountStatus(accountId, status);
    res.status(httpStatus.OK).json(account);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  updateAccountStatus,
};
