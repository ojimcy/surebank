const httpStatus = require('http-status');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateAccountNumber } = require('../utils/account/accountUtils');
const { getBranchByName } = require('./branch.service');
const { getUserByEmail, getUserById } = require('./user.service');

/**
 * Create an account
 * @param {Object} accountData - Account data
 * @param {string} accountData.userId - User ID
 * @param {string} accountData.accountType - Account type
 * @param {string} accountData.branchName - Branch name
 * @param {string} createdBy - ID of the admin user who initiated the creation
 * @returns {Promise<Account>} Created account
 */
const createAccount = async (accountData, createdBy) => {
  const { email, accountType, branchName } = accountData;
  const user = await getUserByEmail(email);
  const userId = user._id;
  // Check if the user already has an account of the specified type
  const existingAccount = await Account.findOne({ userId, accountType });
  if (existingAccount) {
    throw new Error('User already has an account of the specified type');
  }

  // Generate a unique account number
  const accountNumber = await generateAccountNumber();
  const lowerCaseBranchName = branchName.toLowerCase();
  const branch = await getBranchByName(lowerCaseBranchName);

  if (!branch) {
    throw new Error('Branch not found');
  }

  // Fetch the manager's name if available
  let managerName = null;
  if (accountData.accountManagerId) {
    const manager = await getUserById(accountData.accountManagerId);
    managerName = `${manager.firstName} ${manager.lastName}`;
  }

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
    managerName,
    branchName: lowerCaseBranchName,
    branchId: branch._id,
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
    throw new Error('User does not have an account');
  }
  return account.accountNumber;
};

/**
 * Retrieve account details for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Account>} User's account details
 */
const getUserAccount = async (userId) => {
  const account = await Account.findOne({ userId });
  if (!account) {
    throw new Error('User does not have an account');
  }
  return account;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getAllAccounts = async (filter, options) => {
  const accounts = await Account.paginate(filter, options);
  return accounts;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deletAccount = async (userId) => {
  const account = await getUserAccount(userId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  await account.remove();
  return account;
};

/**
 * Get the account manager of an account based on the account number
 * @param {string} accountNumber - Account number
 * @returns {Promise<User>} Account manager user object
 */
const getAccountManager = async (accountNumber) => {
  const account = await Account.findOne({ accountNumber }).populate('accountManagerId', '-password');
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  if (!account.accountManagerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account manager not assigned');
  }

  return account.accountManagerId;
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  getUserAccountNumber,
  getUserAccount,
  getAllAccounts,
  deletAccount,
  getAccountManager,
};
