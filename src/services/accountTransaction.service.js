const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Helper function to find a branch by account number
 * @param {string} accountNumber - Account number
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Branch details
 */
const findBranchByAccountNumber = async (accountNumber, session) => {
  const AccountModel = await Account();
  const branch = await AccountModel.findOne({ accountNumber }).session(session);
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
  const AccountModel = await Account();
  const accountDetail = await AccountModel.findOne({ accountNumber });
  if (!accountDetail) {
    throw new Error('Account number does not exist');
  }
  return accountDetail;
};

/**
 * Make a deposit for a customer
 * @param {Object} depositInput - Deposit input
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Deposit result
 */
const makeCustomerDeposit = async (depositInput) => {
  const AccountModel = await Account();
  const AccountTransactionModel = await AccountTransaction();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = await findBranchByAccountNumber(depositInput.accountNumber, session);

    const transactionDate = new Date().getTime();
    const customerDeposit = await AccountTransactionModel.create(
      [
        {
          accountNumber: depositInput.accountNumber,
          amount: depositInput.amount,
          createdBy: depositInput.createdBy,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'inflow',
          narration: depositInput.narration,
        },
      ],
      { session }
    );

    const updatedBalance = await AccountModel.findOneAndUpdate(
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
  const AccountModel = await Account();
  const account = await AccountModel.findByIdAndUpdate(accountId, { $set: { status } }, { new: true });
  return account;
};

/**
 * Put an amount on hold for a specific account
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to put on hold
 * @returns {Promise<Object>} Result of the operation
 */
const putAmountOnHold = async (accountNumber, amount) => {
  const AccountModel = await Account();
  const updatedBalance = await AccountModel.findOneAndUpdate(
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
  const AccountModel = await Account();
  const accountBalance = await AccountModel.findOne({ accountNumber });
  const amountToBeSpent = accountBalance.ledgerBalance - accountBalance.availableBalance;

  if (amount > amountToBeSpent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Amount is not made available');
  }

  const updatedBalance = await AccountModel.findOneAndUpdate(
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
  const AccountModel = await Account();
  const updatedBalance = await AccountModel.findOneAndUpdate(
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
  const AccountModel = await Account();
  const accountBalance = await AccountModel.findOne({ accountNumber });
  return accountBalance.availableBalance;
};

/**
 * Get account balance
 * @param {string} accountNumber
 * @returns {Promise<Account>}
 */
const getAccountBalance = async (accountNumber) => {
  const AccountModel = await Account();
  const accountBalance = await AccountModel.findOne({ accountNumber });
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
const makeWithdrawalRequest = async (accountNumber, amount, createdBy) => {
  const AccountModel = await Account();
  const AccountTransactionModel = await AccountTransaction();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({ accountNumber }).session(session);
    if (!account) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    if (account.availableBalance < amount) {
      throw new ApiError(400, 'Insufficient balance to request cash.');
    }

    const transactionDate = new Date().getTime();
    const branch = await AccountModel.findOne({ accountNumber }).session(session);

    // Create withdrawal request transaction
    const withdrawalRequest = await AccountTransactionModel.create(
      [
        {
          accountNumber,
          amount,
          createdBy,
          userReps: account.accountManagerId,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'outflow',
          status: 'pending',
          narration: 'Request Cash',
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
 * @param {string} [createdBy] - Optional createdBy to filter by
 * @returns {Promise<Array>} Array of ds withdrawals
 */
const getAllWithdrawalRequests = async (startDate, endDate, branchId, createdBy) => {
  const AccountTransactionModel = await AccountTransaction();
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

    // Optional createdBy filtering
    if (createdBy) {
      query.createdBy = createdBy;
    }
    query.status = 'pending';
    query.narration = 'Request Cash';
    const withdrawalRequests = await AccountTransactionModel.find(query)
      .populate([
        {
          path: 'createdBy',
          select: 'firstName lastName',
        },
        {
          path: 'createdBy',
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
  const AccountTransactionModel = await AccountTransaction();
  const request = await AccountTransactionModel.findById(requestId)
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
    .sort({ date: -1 });
  return request;
};

/**
 * Make withdrawal for a customer
 * @param {string} requestId - Withdrawal request ID
 * @param {string} createdBy - User fulfilling the request
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Result of the operation
 */
const makeCustomerWithdrawal = async (requestId) => {
  const AccountTransactionModel = await AccountTransaction();
  const AccountModel = await Account();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawalRequest = await getWithdrawalRequestById(requestId);
    if (!withdrawalRequest) {
      throw new ApiError(404, 'Withdrawal request does not exist.');
    }
    if (withdrawalRequest.status !== 'pending' || withdrawalRequest.narration !== 'Request Cash') {
      throw new ApiError(400, 'Invalid withdrawal request.');
    }
    const { accountNumber } = withdrawalRequest;
    const { amount } = withdrawalRequest;
    const { createdBy } = withdrawalRequest;
    const accountBalance = await getAccountBalance(accountNumber);

    if (accountBalance < amount) {
      throw new ApiError(500, 'Insufficient balance to fulfill the request.');
    }

    const transactionDate = new Date().getTime();
    // Create a new transaction to represent the fulfilled withdrawal
    const fulfilledWithdrawal = await AccountTransactionModel.create(
      [
        {
          createdBy: withdrawalRequest.createdBy,
          branchId: withdrawalRequest.branchId,
          narration: withdrawalRequest.narration,
          direction: 'outflow',
          status: 'approved',
          date: transactionDate,
          amount: withdrawalRequest.amount,
          accountNumber: withdrawalRequest.accountNumber,
        },
      ],
      { session }
    );
    // Update the withdrawal request
    withdrawalRequest.narration = 'Request Cash';
    withdrawalRequest.createdBy = createdBy;
    await withdrawalRequest.save();

    // Deduct the withdrawn amount from the account
    const updatedBalance = await AccountModel.findOneAndUpdate(
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
 * Reject a withdrawal request
 * @param {string} requestId - Withdrawal request ID
 * @returns {Promise<Object>} Result of the operation
 */
const rejectWithdrawalRequest = async (requestId, narration) => {
  const withdrawalRequest = await getWithdrawalRequestById(requestId);
  if (!withdrawalRequest) {
    throw new ApiError(404, 'Withdrawal request does not exist.');
  }
  withdrawalRequest.narration = narration;
  withdrawalRequest.direction = 'rejected';
  await withdrawalRequest.save();

  return withdrawalRequest;
};

/**
 * Get account transactions with optional filtering by account number, userReps, page, limit, and narration
 * @param {Object} options - Query options
 * @param {string} [options.accountNumber] - Optional account number for filtering
 * @param {string} [options.userReps] - Optional userReps for filtering
 * @param {number} [options.page] - Optional current page number
 * @param {number} [options.limit] - Optional maximum number of transactions per page
 * @param {string} [options.narration] - Optional narration for filtering
 * @returns {Promise<Array>} Array of account transactions
 */
const getAccountTransactions = async (options = {}) => {
  const AccountTransactionModel = await AccountTransaction();
  const { accountNumber, userReps, page = 1, limit, narration } = options;
  const skip = (page - 1) * limit;

  // Construct the query object
  const query = {};

  if (accountNumber) {
    query.accountNumber = accountNumber;
  }

  if (userReps) {
    query.userReps = userReps;
  }

  if (narration) {
    query.narration = narration;
  }

  const transactions = await AccountTransactionModel.find(query)
    .populate([
      {
        path: 'userReps',
        select: 'firstName lastName',
      },
      {
        path: 'createdBy',
        select: 'firstName lastName',
      },
    ])
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
 * @param {string} [createdBy] - Optional createdBy to filter by
 * @returns {Promise<Array>} Array of ds withdrawals
 */
const getCustomerwithdrawals = async (startDate, endDate, branchId, createdBy, accountNumber) => {
  const AccountTransactionModel = await AccountTransaction();
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

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (accountNumber) {
      query.accountNumber = accountNumber;
    }

    query.direction = 'outflow';
    const withdrawals = await AccountTransactionModel.find(query)
      .populate([
        {
          path: 'createdBy',
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
  rejectWithdrawalRequest,
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
};
