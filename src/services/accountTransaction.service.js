const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Account, User, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');

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
 * @returns {Promise<Object>} Result of the operation
 */
const makeCustomerDeposit = async (depositInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const confirmAccountNumber = await getUserByAccountNumber(depositInput.accountNumber);
    if (!confirmAccountNumber) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    const transactionDate = new Date().getTime();
    const branch = await Account.findOne({ accountNumber: depositInput.accountNumber });
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
 * Make withdrawal for a customer
 * @param {Object} depositInput - Withdrawal input
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Result of the operation
 */
const makeCustomerWithdrawal = async (withdrawalInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const confirmAccountNumber = await getUserByAccountNumber(withdrawalInput.accountNumber);
    if (!confirmAccountNumber) {
      throw new ApiError(404, 'Account number does not exist.');
    }
    const accountBalance = await getAccountBalance(withdrawalInput.accountNumber);

    if (accountBalance < withdrawalInput.amount) {
      throw new ApiError(500, 'Insufficient balance');
    }
    const transactionDate = new Date().getTime();
    const branch = await Account.findOne({ accountNumber: withdrawalInput.accountNumber });

    const customerWithdrawal = await AccountTransaction.create(
      [
        {
          accountNumber: withdrawalInput.accountNumber,
          amount: withdrawalInput.amount,
          userReps: withdrawalInput.userReps,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'outflow',
          narration: withdrawalInput.narration,
        },
      ],
      { session }
    );
    const updatedBalance = await Account.findOneAndUpdate(
      { accountNumber: withdrawalInput.accountNumber },
      {
        $inc: {
          availableBalance: -withdrawalInput.amount,
          ledgerBalance: -withdrawalInput.amount,
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
      withdrawalDetail: customerWithdrawal,
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
};
