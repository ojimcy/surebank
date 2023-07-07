const { Package } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber } = require('./accountTransaction.service');

/**
 * Create a daily savings package
 * @param {Object} dailyInput - Daily savings package input
 * @returns {Promise<Object>} Result of the operation
 */
const createDailySavingsPackage = async (dailyInput) => {
  const confirmAccountNumber = await getUserByAccountNumber(dailyInput.accountNumber);
  if (!confirmAccountNumber) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  const userPackageExist = await Package.findOne({
    accountNumber: dailyInput.accountNumber,
    status: 'open',
  });

  if (userPackageExist) {
    throw new ApiError('Customer has an active package running');
  }

  const createdPackage = await Package.create({
    ...dailyInput,
  });

  return createdPackage;
};

module.exports = {
  createDailySavingsPackage,
};
