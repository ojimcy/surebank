const mongoose = require('mongoose');
const { Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, getAccountBalance } = require('./accountTransaction.service');
const { userService, accountService } = require('.');

/**
 * Create a customer
 * @param {Object} customerData - Customer data
 * @param {string} customerData.email - Customer's email
 * @param {string} customerData.password - Customer's password
 * @param {string} customerData.firstName - Customer's first name
 * @param {string} customerData.lastName - Customer's last name
 * @param {string} customerData.address - Customer's address
 * @param {string} customerData.accountType - Account type
 * @param {string} customerData.phoneNumber - Customer's phone number
 * @param {string} customerData.branchId - Branch ID
 * @param {string} createdBy - ID of the admin user who initiated the creation
 * @returns {Promise<{ user: User, account: Account }>} Created user and account
 */
const createCustomer = async (customerData, createdBy) => {
  // Check if the user already exists
  let user = await userService.getUserByEmail(customerData.email);

  if (!user) {
    // If user doesn't exist, create a new user
    user = await userService.createUser({
      email: customerData.email,
      password: customerData.password,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      address: customerData.address,
      phoneNumber: customerData.phoneNumber,
      branchId: customerData.branchId,
    });
  }

  // Create an account for the user
  const accountData = {
    email: user.email,
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    accountType: customerData.accountType,
    branchId: customerData.branchId,
    accountManagerId: null,
  };

  const account = await accountService.createAccount(accountData, createdBy);

  return { user, account };
};

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
  createCustomer,
  makeDeposit,
  makeWithdrawal,
};
