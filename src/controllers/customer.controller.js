const { startSession } = require('mongoose');
const httpStatus = require('http-status');
const { accountService, userService, customerService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCustomer = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, address, accountType, branchId } = req.body;

  // Start a MongoDB session
  const session = await startSession();

  try {
    session.startTransaction();

    // Create the user within the session
    const user = await userService.createUser(
      {
        email,
        password,
        firstName,
        lastName,
        address,
        role: 'user',
      },
      session
    );

    // Create the account for the user within the session
    const accountData = {
      userId: user._id,
      accountType: accountType || '',
      branchId: branchId || 'Hq',
    };

    const createdBy = req.user._id;

    const account = await accountService.createAccount(accountData, createdBy, session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return the created user and account as the response
    res.status(httpStatus.CREATED).json({ user, account });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    // Forward the error
    throw error;
  }
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
