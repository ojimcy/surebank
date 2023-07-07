const mongoose = require('mongoose');
const { Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, getAccountBalance } = require('./accountTransaction.service');

/**
 * Make a deposit
 * @param {Object} depositInput - Deposit input
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object>} Result of the operation
 */
const makeDeposit = async (depositInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const confirmAccountNumber = await getUserByAccountNumber(depositInput.accountNumber);
    if (!confirmAccountNumber) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    const transactionDate = new Date().getTime();

    const customerDeposit = await AccountTransaction.create(
      [
        {
          accountNumber: depositInput.accountNumber,
          amount: depositInput.amount,
          operatorId: depositInput.operatorId,
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
 * Make withdrawal for a customer
 * @param {Object} withdrawalInput - Withdrawal input
 * @param {string} userId - ID of the logged-in user
 * @returns {Promise<Object>} Result of the operation
 */
const makeWithdrawal = async (withdrawalInput, userId, operatorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const confirmAccountNumber = await getUserByAccountNumber(withdrawalInput.accountNumber);
    if (!confirmAccountNumber) {
      throw new ApiError(404, 'Account number does not exist.');
    }
    if (confirmAccountNumber._id.toString() !== userId) {
      throw new ApiError(404, "You can't make this transaction");
    }
    const accountBalance = await getAccountBalance(withdrawalInput.accountNumber);

    if (accountBalance < withdrawalInput.amount) {
      throw new ApiError(500, 'Insufficient balance');
    }

    const transactionDate = new Date().getTime();

    const customerWithdrawal = await AccountTransaction.create(
      [
        {
          accountNumber: withdrawalInput.accountNumber,
          amount: withdrawalInput.amount,
          operatorId,
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
      { new: true, runValidators: true, session }
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

module.exports = {
  makeDeposit,
  makeWithdrawal,
};
