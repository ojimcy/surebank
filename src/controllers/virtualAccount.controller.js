const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { virtualAccountService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Create a virtual account for the authenticated user
 */
const createVirtualAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const virtualAccount = await virtualAccountService.createVirtualAccount(userId);
  res.status(httpStatus.CREATED).send(virtualAccount);
});

/**
 * Get the virtual account of the authenticated user
 */
const getVirtualAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const virtualAccount = await virtualAccountService.getUserVirtualAccount(userId);
  res.status(httpStatus.OK).send(virtualAccount);
});

/**
 * Create a virtual account for a specific user (admin only)
 */
const createUserVirtualAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const virtualAccount = await virtualAccountService.createVirtualAccount(userId);
  res.status(httpStatus.CREATED).send(virtualAccount);
});

/**
 * Deactivate a user's virtual account (admin or account owner)
 */
const deactivateVirtualAccount = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // If not admin, ensure user can only deactivate their own account
  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only deactivate your own virtual account');
  }

  const virtualAccount = await virtualAccountService.deactivateVirtualAccount(userId);
  res.status(httpStatus.OK).send(virtualAccount);
});

module.exports = {
  createVirtualAccount,
  getVirtualAccount,
  createUserVirtualAccount,
  deactivateVirtualAccount,
};
