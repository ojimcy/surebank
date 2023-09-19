const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Account, User, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Helper function to find a branch by account number
 * @param {string} accountNumber - Account number
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Branch details
 */
const findBranchByAccountNumber = async (accountNumber, session) => {
  const branch = await Account.findOne({ accountNumber }).session(session);
  if (!branch) {
    throw new ApiError(404, 'Account number does not exist.');
  }
  return branch;
};

/**
 * Get user and account details by account number
 * @param {string} accountNumber - Account number
 * @returns {Promise<Object>} Result of the operation
 */
const getUserByAccountNumber = async (accountNumber) => {
  const accountDetail = await Account.findOne({ accountNumber });
  if (!accountDetail) {
    throw new Error('Account number does not exist');
  }
  const { userId } = accountDetail;
  const userDetail = await User.findById(userId);
  return userDetail;
};

/**
 * Make a deposit for a customer
 * @param {Object} depositInput - Deposit input
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Deposit result
 */
const makeCustomerDeposit = async (depositInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = await findBranchByAccountNumber(depositInput.accountNumber, session);

    const transactionDate = new Date().getTime();
    const customerDeposit = await AccountTransaction.create(
      [
        {
          accountNumber: depositInput.accountNumber,
          amount: depositInput.amount,
          userReps: depositInput.userReps,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'inflow',
          narration: depositInput.narration,
        },
      ],
      { session }
    );

    const updatedBalance = await Account.findOneAndUpdate(
      { accountNumber: depositInput.accountNumber },
      {
        $inc: {
          ledgerBalance: depositInput.amount,
          availableBalance: depositInput.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      availableBalance: updatedBalance.availableBalance,
      depositDetail: customerDeposit[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Update the status of an account
 * @param {string} accountId - Account ID
 * @param {string} status - New account status
 * @returns {Promise<Account>} Updated account
 */
const updateAccountStatus = async (accountId, status) => {
  const account = await Account.findByIdAndUpdate(accountId, { $set: { status } }, { new: true });
  return account;
};

/**
 * Put an amount on hold for a specific account
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to put on hold
 * @returns {Promise<Object>} Result of the operation
 */
const putAmountOnHold = async (accountNumber, amount) => {
  const updatedBalance = await Account.findOneAndUpdate(
    { accountNumber },
    { $inc: { availableBalance: -amount } },
    { new: true, runValidators: true }
  );

  return updatedBalance;
};

/**
 * Spend the held amount for a specific account
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to spend
 * @returns {Promise<Object>} Result of the operation
 */
const spendHeldAmount = async (accountNumber, amount) => {
  const accountBalance = await Account.findOne({ accountNumber });
  const amountToBeSpent = accountBalance.ledgerBalance - accountBalance.availableBalance;

  if (amount > amountToBeSpent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Amount is not made available');
  }

  const updatedBalance = await Account.findOneAndUpdate(
    { accountNumber },
    { $inc: { ledgerBalance: -amount } },
    { new: true, runValidators: true }
  );

  return updatedBalance;
};

/**
 * Move the held amount to available balance for a specific account
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to move from held to available
 * @returns {Promise<Object>} Result of the operation
 */
const moveHeldAmountToAvailable = async (accountNumber, amount) => {
  const updatedBalance = await Account.findOneAndUpdate(
    { accountNumber },
    { $inc: { availableBalance: amount } },
    { new: true, runValidators: true }
  );

  return updatedBalance;
};

/**
 * Get available balance
 * @param {string} accountNumber
 * @returns {Promise<Account>}
 */
const getAvailableBalance = async (accountNumber) => {
  const accountBalance = await Account.findOne({ accountNumber });
  return accountBalance.availableBalance;
};

/**
 * Get account balance
 * @param {string} accountNumber
 * @returns {Promise<Account>}
 */
const getAccountBalance = async (accountNumber) => {
  const accountBalance = await Account.findOne({ accountNumber });
  return accountBalance.ledgerBalance;
};

/**
 * Make withdrawal Request
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to request
 * @param {string} userReps - User making the request
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Result of the operation
 */
const makeWithdrawalRequest = async (accountNumber, amount, createdBy, narration) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findOne({ accountNumber }).session(session);
    if (!account) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    if (account.availableBalance < amount) {
      throw new ApiError(400, 'Insufficient balance to request cash.');
    }

    const transactionDate = new Date().getTime();
    const branch = await Account.findOne({ accountNumber }).session(session);

    // Create withdrawal request transaction
    const withdrawalRequest = await AccountTransaction.create(
      [
        {
          accountNumber,
          amount,
          createdBy,
          userReps: account.accountManagerId,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'pending',
          narration: narration || 'Request Cash',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      withdrawalRequest,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all withdrawal requests within a date range
 * @param {Date} [startDate] - Start date of the range
 * @param {Date} [endDate] - End date of the range
 * @param {string} [branchId] - Optional branch ID to filter by
 * @param {string} [userReps] - Optional userReps to filter by
 * @returns {Promise<Array>} Array of ds withdrawals
 */
const getAllWithdrawalRequests = async (startDate, endDate, branchId, userReps) => {
  try {
    const query = {};
    // Optional date range filtering
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    // Optional branch filtering
    if (branchId) {
      query.branchId = branchId;
    }

    // Optional userReps filtering
    if (userReps) {
      query.userReps = userReps;
    }
    query.direction = 'pending';
    query.narration = 'Fund withdrawal';
    const withdrawalRequests = await AccountTransaction.find(query)
      .populate([
        {
          path: 'userReps',
          select: 'firstName lastName',
        },
        {
          path: 'accountManagerId',
          select: 'firstName lastName',
        },
        {
          path: 'branchId',
          select: 'name',
        },
      ])
      .sort({ date: -1 })
      .lean();

    return withdrawalRequests;
  } catch (error) {
    throw new ApiError('Failed to fetch withdrawal requests', error);
  }
};

/**
 * Get a specific withdrawal request by ID
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} Withdrawal request details
 */
const getWithdrawalRequestById = async (requestId) => {
  const request = await AccountTransaction.findById(requestId)
    .populate([
      {
        path: 'createdBy',
        select: 'firstName lastName',
      },
      {
        path: 'userReps',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .sort({ date: -1 })
    .lean();
  return request;
};

/**
 * Make withdrawal for a customer
 * @param {string} requestId - Withdrawal request ID
 * @param {string} userReps - User fulfilling the request
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Result of the operation
 */
const makeCustomerWithdrawal = async (requestId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawalRequest = await getWithdrawalRequestById(requestId);
    if (!withdrawalRequest) {
      throw new ApiError(404, 'Withdrawal request does not exist.');
    }
    if (withdrawalRequest.direction !== 'pending' || withdrawalRequest.narration !== 'Fund withdrawal') {
      throw new ApiError(400, 'Invalid withdrawal request.');
    }
    const { accountNumber } = withdrawalRequest;
    const { amount } = withdrawalRequest;
    const { userReps } = withdrawalRequest;
    const accountBalance = await getAccountBalance(accountNumber);

    if (accountBalance < amount) {
      throw new ApiError(500, 'Insufficient balance to fulfill the request.');
    }

    const transactionDate = new Date().getTime();
    // Create a new transaction to represent the fulfilled withdrawal
    const fulfilledWithdrawal = await AccountTransaction.create(
      [
        {
          userReps: withdrawalRequest.userReps,
          branchId: withdrawalRequest.branchId,
          narration: withdrawalRequest.narration,
          direction: 'outflow',
          date: transactionDate,
          amount: withdrawalRequest.amount,
          accountNumber: withdrawalRequest.accountNumber,
        },
      ],
      { session }
    );
    // Update the withdrawal request
    withdrawalRequest.narration = 'fulfilled';
    withdrawalRequest.userReps = userReps;
    await withdrawalRequest.save();

    // Deduct the withdrawn amount from the account
    const updatedBalance = await Account.findOneAndUpdate(
      { accountNumber },
      {
        $inc: {
          availableBalance: -amount,
          ledgerBalance: -amount,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      accountBalance: updatedBalance.availableBalance,
      fulfilledWithdrawal,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get account transactions for a specific account with pagination
 * @param {string} accountNumber - Account number
 * @param {number} page - Current page number
 * @param {number} limit - Maximum number of transactions per page
 * @returns {Promise<Array>} Array of account transactions
 */
const getAccountTransactions = async (accountNumber, page, limit) => {
  const skip = (page - 1) * limit;
  const transactions = await AccountTransaction.find({ accountNumber })
    .populate('userReps', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ date: 'desc' });
  return transactions;
};

/**
 * Get customer withdrawals within a date range
 * @param {Date} [startDate] - Start date of the range
 * @param {Date} [endDate] - End date of the range
 * @param {string} [branchId] - Optional branch ID to filter by
 * @param {string} [userReps] - Optional userReps to filter by
 * @returns {Promise<Array>} Array of ds withdrawals
 */
const getCustomerwithdrawals = async (startDate, endDate, branchId, userReps, accountNumber) => {
  try {
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (startDate) {
      query.date = { $gte: startDate };
    }
    if (endDate) {
      query.date = { $lte: endDate };
    }

    if (branchId) {
      query.branchId = branchId;
    }

    if (userReps) {
      query.userReps = userReps;
    }

    if (accountNumber) {
      query.accountNumber = accountNumber;
    }

    query.direction = 'outflow';
    const withdrawals = await AccountTransaction.find(query)
      .populate([
        {
          path: 'userReps',
          select: 'firstName lastName',
        },
        {
          path: 'branchId',
          select: 'name',
        },
      ])
      .sort({ date: -1 })
      .lean();

    return withdrawals;
  } catch (error) {
    throw new ApiError('Failed to fetch customer withdrawals', error);
  }
};

module.exports = {
  getUserByAccountNumber,
  makeCustomerDeposit,
  updateAccountStatus,
  putAmountOnHold,
  spendHeldAmount,
  moveHeldAmountToAvailable,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getCustomerwithdrawals,
  makeWithdrawalRequest,
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
};
