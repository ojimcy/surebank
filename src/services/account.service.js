const httpStatus = require('http-status');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateAccountNumber } = require('../utils/account/accountUtils');
const { getUserByEmail } = require('./user.service');

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
  const { email, accountType, branchId } = accountData;
  const user = await getUserByEmail(email);
  const userId = user._id;
  // Check if the user already has an account of the specified type
  const existingAccount = await Account.findOne({ userId, accountType });
  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has an account of the specified type');
  }

  // Generate a unique account number
  const accountNumber = await generateAccountNumber();

  // Create the account object
  const account = {
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    accountNumber,
    availableBalance: 0,
    ledgerBalance: 0,
    accountType,
    createdBy,
    accountManagerId: accountData.accountManagerId || null,
    branchId,
    status: 'active',
  };

  return Account.create(account);
};

/**
 * Assign a branch to a user based on the account ID
 * @param {string} accountId - Account ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Account>} Updated account
 */
const assignBranch = async (accountId, branchId) => {
  const account = await Account.findByIdAndUpdate(accountId, { $set: { branchId } }, { new: true });
  return account;
};

/**
 * Asign account manager to a given account
 * @param {string} accountId - Account ID
 * @param {string} managerId - New account manager ID
 * @returns {Promise<Account>} Updated account
 */
const assignManager = async (accountId, managerId) => {
  const account = await Account.findByIdAndUpdate(accountId, { $set: { accountManagerId: managerId } }, { new: true });
  return account;
};

/**
 * Retrieve user's account number
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's account number
 */
const getUserAccountNumber = async (userId) => {
  const account = await Account.findOne({ userId });
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
const getUserAccount = async (userId) => {
  const account = await Account.findOne({ userId })
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
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have an account');
  }
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
  const accounts = await Account.paginate(filter, options, {
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
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const branchAccount = await Account.find({ branchId }).skip(skip).limit(limit).sort(sortBy);
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
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const staffAccount = await Account.find({ accountManagerId: staffId }).skip(skip).limit(limit).sort(sortBy);
  return staffAccount;
};

/**
 * Delete an account by account ID
 * @param {string} accountId - Account ID
 * @returns {Promise<Account>} Deleted account
 */
const deleteAccount = async (accountId) => {
  const account = await Account.findById(accountId);
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
  const account = await Account.findByIdAndUpdate(accountId, updateBody, { new: true });
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
  return Account.findById(id)
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
};
