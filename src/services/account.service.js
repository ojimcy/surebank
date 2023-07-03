const { Account } = require('../models');
const { generateAccountNumber } = require('../utils/account/accountUtils');

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
  const { userId, accountType, branchId } = accountData;

  // Check if the user already has an account of the specified type
  const existingAccount = await Account.findOne({ userId, accountType });
  if (existingAccount) {
    throw new Error('User already has an account of the specified type');
  }

  // Generate a unique account number
  const accountNumber = await generateAccountNumber();

  // Create the account object
  const account = {
    userId,
    accountNumber,
    availableBalance: 0,
    ledgerBalance: 0,
    accountType,
    createdBy,
    accountManagerId: '',
    branchId,
    status: 'pending',
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
 * Update the status of an account
 * @param {string} accountId - Account ID
 * @param {string} status - New account status
 * @returns {Promise<Account>} Updated account
 */
const updateAccountStatus = async (accountId, status) => {
  const account = await Account.findByIdAndUpdate(accountId, { $set: { status } }, { new: true });
  return account;
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  updateAccountStatus,
};
