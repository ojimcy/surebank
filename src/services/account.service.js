const httpStatus = require('http-status');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateAccountNumber } = require('../utils/account/accountUtils');
const { getUserByEmail, getUserById, getUserByPhoneNumber } = require('./user.service');
const config = require('../config/config');
const { kycService } = require('.');

/**
 * Create an account
 * @param {Object} accountData - Account data
 * @param {string} accountData.userId - User ID
 * @param {string} accountData.accountType - Account type
 * @param {string} accountData.branchId - Branch ID
 * @param {string} createdBy - ID of the admin user who initiated the creation
 * @returns {Promise<Account>} Created account
 */
const createAccount = async (accountData, createdBy) => {
  const accountModel = await Account();
  const { accountType, branchId } = accountData;
  let user;
  if (accountData.email) {
    user = await getUserByEmail(accountData.email);
  } else {
    user = await getUserByPhoneNumber(accountData.phoneNumber);
  }

  const userId = user._id;
  // Check if the user already has an account of the specified type
  const existingAccount = await accountModel.findOne({ userId, accountType });
  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has an account of the specified type');
  }

  if (!branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch is required');
  }

  const accManager = await getUserById(createdBy);

  // Generate a unique account number
  const accountNumber = await generateAccountNumber();

  // Create the account object
  const account = {
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    accountNumber,
    availableBalance: 0,
    ledgerBalance: 0,
    accountType,
    createdBy,
    accountManagerId: accManager.role === 'userReps' ? createdBy : null,
    branchId,
    status: 'active',
  };

  return accountModel.create(account);
};

/**
 * Assign a branch to a user based on the account ID
 * @param {string} accountId - Account ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Account>} Updated account
 */
const assignBranch = async (accountId, branchId) => {
  const accountModel = await Account();
  const account = await accountModel.findByIdAndUpdate(accountId, { $set: { branchId } }, { new: true });
  return account;
};

/**
 * Asign account manager to a given account
 * @param {string} accountId - Account ID
 * @param {string} managerId - New account manager ID
 * @returns {Promise<Account>} Updated account
 */
const assignManager = async (accountId, managerId) => {
  const accountModel = await Account();
  const account = await accountModel.findByIdAndUpdate(accountId, { $set: { accountManagerId: managerId } }, { new: true });
  return account;
};

/**
 * Retrieve user's account number
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's account number
 */
const getUserAccountNumber = async (userId) => {
  const accountModel = await Account();
  const account = await accountModel.findOne({ userId });
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have an account');
  }
  return account.accountNumber;
};

/**
 * Retrieve account details for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Account>} User's account details
 */
const getUserAccount = async (userId, accountType) => {
  const accountModel = await Account();
  const account = await accountModel
    .findOne({ userId, accountType })
    .populate([
      {
        path: 'accountManagerId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
      {
        path: 'userId',
        select: 'email phoneNumber firstName',
      },
    ])
    .lean();
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have an account');
  }
  return account;
};

/**
 * Retrieve account details for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Account>} User's account details
 */
const getUserAccounts = async (userId, accountType) => {
  const accountModel = await Account();
  const filter = { userId };
  if (accountType) {
    filter.accountType = accountType;
  }

  const account = await accountModel
    .find(filter)
    .populate([
      {
        path: 'accountManagerId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .lean();

  return account;
};

/**
 * Query for accounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getAllAccounts = async (filter, options) => {
  const accountModel = await Account();
  const accounts = await accountModel.paginate(filter, options, {
    populate: [
      {
        path: 'accountManagerId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ],
  });
  return accounts;
};

/**
 * Get accounts in branch with pagination
 * @param {Object} branchId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ staffIds: Object, totalCounts: number, error: string|null }>}
 */

const getAccountsInBranch = async (branchId, filter, options) => {
  const accountModel = await Account();
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const branchAccount = await accountModel.find({ branchId }).skip(skip).limit(limit).sort(sortBy);
  return branchAccount;
};

/**
 * Get accounts in branch with pagination
 * @param {Object} branchId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ staffIds: Object, totalCounts: number, error: string|null }>}
 */

const getAccountsByStaff = async (staffId, filter, options) => {
  const accountModel = await Account();
  const { limit, page, sortBy } = options;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const staffAccount = await accountModel.find({ accountManagerId: staffId }).skip(skip).limit(limit).sort(sortBy);
  return staffAccount;
};

/**
 * Delete an account by account ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Account>} Deleted account
 */
const deleteAccount = async (accountId) => {
  const accountModel = await Account();
  const account = await accountModel.findById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  await account.remove();
  return account;
};

/**
 * Update an account
 * @param {string} accountId - Account ID
 * @param {Object} updateBody - Updated account data
 * @returns {Promise<Account>} Updated account
 */
const updateAccount = async (accountId, updateBody) => {
  const accountModel = await Account();
  const account = await accountModel.findByIdAndUpdate(accountId, updateBody, { new: true });
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  return account;
};

/**
 * Get account by id
 * @param {ObjectId} id
 * @returns {Promise<Account>}
 */
const getAccountById = async (id) => {
  const accountModel = await Account();
  return accountModel
    .findById(id)
    .populate([
      {
        path: 'accountManagerId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .lean();
};

/**
 * Create a self-service account for logged in user
 * @param {string} userId - User ID
 * @param {string} accountType - Account type
 * @returns {Promise<Account>} Created account
 */
const createSelfAccount = async (userId, accountType) => {
  const accountModel = await Account();
  const user = await getUserById(userId);
  // kyc check
  if (user.kycStatus !== 'verified') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please complete your KYC to create an account');
  }

  // Check if the user already has an account of the specified type
  const existingAccount = await accountModel.findOne({ userId, accountType });
  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You already have an account of the specified type');
  }

  // Generate a unique account number
  const accountNumber = await generateAccountNumber();

  // Create the account object
  const account = {
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    accountNumber,
    availableBalance: 0,
    ledgerBalance: 0,
    accountType,
    createdBy: userId, // Self-created
    branchId: config.onlineBranchId,
    status: 'active',
  };

  return accountModel.create(account);
};

/**
 * Updates an account's BVN and verifies it
 * @param {string} accountId - Account ID
 * @param {string} bvn - Bank Verification Number
 * @returns {Promise<Account>} Updated account
 */
const updateAccountBvn = async (accountId, bvn) => {
  const accountModel = await Account();

  // Validate BVN format
  if (bvn.length !== 11) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'BVN must be 11 digits');
  }

  // Find the account
  const account = await accountModel.findById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  // Get the user associated with this account
  const user = await getUserById(account.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Update and verify the user's BVN instead of the account's
  await kycService.updateUserBvn(account.userId, bvn);

  return accountModel.findById(accountId);
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  getUserAccountNumber,
  getUserAccount,
  getAllAccounts,
  getAccountsInBranch,
  getAccountsByStaff,
  deleteAccount,
  updateAccount,
  getAccountById,
  getUserAccounts,
  createSelfAccount,
  updateAccountBvn,
};
