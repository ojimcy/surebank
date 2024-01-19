const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Account, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getAccountByNumber, getAccountBalance } = require('./accountTransaction.service');
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
const createCustomer = async (customerData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists
    let user = await userService.getUserByEmail(customerData.email);

    if (!user) {
      // If user doesn't exist, create a new user within the transaction
      user = await userService.createUser(
        {
          email: customerData.email,
          password: customerData.password,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          address: customerData.address,
          phoneNumber: customerData.phoneNumber,
          branchId: customerData.branchId,
        },
        session
      );
    }

    // Create an account for the user within the transaction
    const accountData = {
      email: user.email,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      accountType: customerData.accountType,
      branchId: customerData.branchId,
      accountManagerId: null,
    };
    const account = await accountService.createAccount(accountData, customerData.createdBy, session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { user, account };
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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
    const AccountModel = await Account();
    const AccountTransactionModel = await AccountTransaction();
    const userAccount = await getAccountByNumber(depositInput.accountNumber);
    if (!userAccount) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account number does not exist.');
    }

    const transactionDate = new Date().getTime();

    const customerDeposit = await AccountTransactionModel.create(
      [
        {
          accountNumber: depositInput.accountNumber,
          amount: depositInput.amount,
          userReps: depositInput.userReps,
          date: transactionDate,
          direction: 'inflow',
          narration: depositInput.narration,
          userId: userAccount.userId,
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
 * Make withdrawal for a customer
 * @param {Object} withdrawalInput - Withdrawal input
 * @param {string} userId - ID of the logged-in user
 * @returns {Promise<Object>} Result of the operation
 */
const makeWithdrawal = async (withdrawalInput, userId, userReps) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const AccountModel = await Account();
    const AccountTransactionModel = await AccountTransaction();
    const userAccount = await getAccountByNumber(withdrawalInput.accountNumber);
    if (!userAccount) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account number does not exist.');
    }
    if (userAccount.userId.toString() !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, "You can't make this transaction");
    }
    const accountBalance = await getAccountBalance(withdrawalInput.accountNumber);

    if (accountBalance < withdrawalInput.amount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
    }

    const transactionDate = new Date().getTime();

    const customerWithdrawal = await AccountTransactionModel.create(
      [
        {
          accountNumber: withdrawalInput.accountNumber,
          amount: withdrawalInput.amount,
          userReps,
          date: transactionDate,
          direction: 'outflow',
          narration: withdrawalInput.narration,
          userId: userAccount.userId,
        },
      ],
      { session }
    );

    const updatedBalance = await AccountModel.findOneAndUpdate(
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

/**
 * Get user reps customers
 * @param {Object} branchId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<GetUserepsCustomer>}
 */

const getCustomersByUserReps = async (userReps, filter, options) => {
  const AccountModel = await Account();
  const staffAccount = await AccountModel.paginate({ accountManagerId: userReps }, filter, options);
  return staffAccount;
};

module.exports = {
  createCustomer,
  makeDeposit,
  makeWithdrawal,
  getCustomersByUserReps,
};
