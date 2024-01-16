const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { withdrawalMessage } = require('../templates/sms/templates');
const { sendSms } = require('./sms.service');

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
  return accountDetail;
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
          createdBy: depositInput.createdBy,
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
 * Get held amount for a specific account
 * @param {string} accountNumber - Account number
 * @returns {Promise<number>} Held amount
 */
const getHeldAmount = async (accountNumber) => {
  const accountBalance = await Account.findOne({ accountNumber });

  if (!accountBalance) {
    throw new ApiError(404, 'Account not found');
  }

  const heldAmount = accountBalance.ledgerBalance - accountBalance.availableBalance;
  return heldAmount;
};

/**
 * Make withdrawal request
 * @param {string} accountNumber - Account number
 * @param {number} amount - Amount to request
 * @param {string} createdBy - User making the request
 * @returns {Promise<Object>} Result of the operation
 */
const makeWithdrawalRequest = async (accountNumber, amount, createdBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Ensure account exists
    const account = await Account.findOne({ accountNumber }).session(session);
    if (!account) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    // Check if there is sufficient balance
    if (account.availableBalance < amount) {
      throw new ApiError(400, 'Insufficient balance to request cash.');
    }

    const branch = await Account.findOne({ accountNumber }).session(session);
    const transactionDate = new Date().getTime();

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
          status: 'pending',
          direction: 'outflow',
          narration: 'Request Cash',
        },
      ],
      { session }
    );

    // Deduct the requested amount from the available balance
    const updatedBalance = await putAmountOnHold(accountNumber, amount);
    await session.commitTransaction();

    return {
      withdrawalRequest,
      availableBalance: updatedBalance.availableBalance,
    };
  } catch (error) {
    await session.abortTransaction();
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
const getAllWithdrawals = async (startDate, endDate, branchId, createdBy, status) => {
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

    // Optional createdBy filtering
    if (status) {
      query.status = status;
    }

    query.narration = 'Request Cash';
    const withdrawalRequests = await AccountTransaction.find(query)
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
    .sort({ date: -1 });
  return request;
};

/**
 * Make withdrawal for a customer
 * @param {string} requestId - Withdrawal request ID
 * @returns {Promise<Object>} Result of the operation
 */
const makeCustomerWithdrawal = async (requestId, approvedBy) => {
  try {
    const withdrawalRequest = await getWithdrawalRequestById(requestId);

    if (!withdrawalRequest) {
      throw new ApiError(404, 'Withdrawal request does not exist.');
    }

    if (withdrawalRequest.status !== 'pending') {
      throw new ApiError(400, 'Withdrawal request has been processed!!!.');
    }

    if (withdrawalRequest.narration !== 'Request Cash') {
      throw new ApiError(400, 'Invalid withdrawal request.');
    }

    const { accountNumber, amount } = withdrawalRequest;
    const account = await Account.findOne({ accountNumber });

    const accountBalance = await getAccountBalance(accountNumber);

    if (accountBalance < amount) {
      throw new ApiError(500, 'Insufficient balance to fulfill the request.');
    }

    const transactionDate = new Date().getTime();

    // Update the withdrawal request transaction to represent the fulfilled withdrawal
    withdrawalRequest.direction = 'outflow';
    withdrawalRequest.narration = 'Request Cash';
    withdrawalRequest.status = 'approved';
    withdrawalRequest.date = transactionDate;
    withdrawalRequest.approvedBy = approvedBy;

    await withdrawalRequest.save();

    await spendHeldAmount(accountNumber, amount);

    // Send credit SMS
    const phone = account.phoneNumber;
    const message = withdrawalMessage(
      withdrawalRequest.amount,
      withdrawalRequest.accountNumber,
      account.availableBalance,
      withdrawalRequest.userReps.firstName
    );
    await sendSms(phone, message);

    return {
      fulfilledWithdrawal: withdrawalRequest,
    };
  } catch (error) {
    throw new ApiError('Failed to make customer withdrawal', error);
  }
};

/**
 * Reject a withdrawal request
 * @param {string} requestId - Withdrawal request ID
 * @param {string} narration - Rejection narration
 * @returns {Promise<Object>} Result of the operation
 */
const rejectWithdrawalRequest = async (requestId, narration) => {
  const withdrawalRequest = await getWithdrawalRequestById(requestId);

  if (!withdrawalRequest) {
    throw new ApiError(404, 'Withdrawal request does not exist.');
  }

  // Move held amount to available balance
  const movedAmount = withdrawalRequest.amount;
  const { accountNumber } = withdrawalRequest;

  const updatedBalance = await moveHeldAmountToAvailable(accountNumber, movedAmount);

  // Update withdrawal request details
  withdrawalRequest.narration = narration;
  withdrawalRequest.status = 'rejected';
  withdrawalRequest.direction = 'outflow';
  await withdrawalRequest.save();

  return {
    accountBalance: updatedBalance.availableBalance,
    rejectedWithdrawal: withdrawalRequest,
  };
};

/**
 * Get account transactions with optional filtering by account number, userReps, page, limit, and narration
 * @param {Object} options - Query options
 * @param {string} [options.accountNumber] - Optional account number for filtering
 * @param {string} [options.createdBy] - Optional createdBy for filtering
 * @param {number} [options.page] - Optional current page number
 * @param {number} [options.limit] - Optional maximum number of transactions per page
 * @param {string} [options.narration] - Optional narration for filtering
 * @returns {Promise<Array>} Array of account transactions
 */
const getAccountTransactions = async (options = {}) => {
  const { accountNumber, createdBy, page = 1, limit, narration } = options;
  const skip = (page - 1) * limit;

  // Construct the query object
  const query = {};

  if (accountNumber) {
    query.accountNumber = accountNumber;
  }

  if (createdBy) {
    query.createdBy = createdBy;
  }

  if (narration) {
    query.narration = narration;
  }

  const transactions = await AccountTransaction.find(query)
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
const getCustomerwithdrawals = async (
  startDate,
  endDate,
  branchId,
  createdBy,
  approvedBy,
  accountNumber,
  page,
  limit,
  narration
) => {
  const skip = (page - 1) * limit;
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

    if (approvedBy) {
      query.approvedBy = approvedBy;
    }

    if (accountNumber) {
      query.accountNumber = accountNumber;
    }

    query.narration = 'Request Cash' || narration;
    const withdrawals = await AccountTransaction.find(query)
      .populate([
        {
          path: 'createdBy',
          select: 'firstName lastName',
        },
        {
          path: 'branchId',
          select: 'name',
        },
        {
          path: 'approvedBy',
          select: 'firstName lastName',
        },
      ])
      .skip(skip)
      .limit(limit)
      .sort({ date: 'desc' })
      .lean();

    return withdrawals;
  } catch (error) {
    throw new ApiError('Failed to fetch customer withdrawals', error);
  }
};

/**
 * Get account transactions for a specific staff member
 * @param {string} staffId - Staff ID or createdBy value
 * @param {number} page - Current page number
 * @param {number} limit - Maximum number of transactions per page
 * @returns {Promise<Array>} Array of account transactions
 */
const getAccountTransactionsForStaff = async (staffId, page, limit) => {
  const skip = (page - 1) * limit;

  // Assuming staffId corresponds to the createdBy field
  const transactions = await AccountTransaction.find({ createdBy: staffId }).skip(skip).limit(limit).sort({ date: 'desc' });

  return transactions;
};

module.exports = {
  getUserByAccountNumber,
  makeCustomerDeposit,
  updateAccountStatus,
  putAmountOnHold,
  spendHeldAmount,
  moveHeldAmountToAvailable,
  getAvailableBalance,
  getHeldAmount,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getCustomerwithdrawals,
  makeWithdrawalRequest,
  rejectWithdrawalRequest,
  getAllWithdrawals,
  getWithdrawalRequestById,
  getAccountTransactionsForStaff,
};
