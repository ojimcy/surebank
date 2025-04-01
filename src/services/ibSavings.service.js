const { IbSavingsPackage, Account } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendSms } = require('./sms.service');
const { ibSavingsConfig } = require('../config/ibSavings.config');
const logger = require('../config/logger');
/**
 * Calculate interest rate based on savings type and duration
 * @param {string} savingsType - Type of savings (fixed/flexible)
 * @param {number} duration - Duration in months
 * @returns {number} Calculated interest rate
 */
const calculateInterestRate = (savingsType, duration) => {
  const config = ibSavingsConfig[savingsType];

  // Validate duration limits
  if (savingsType === 'fixed' && duration < config.duration.min) {
    throw new ApiError(400, `Minimum duration for ${savingsType} savings is ${config.duration.min} months`);
  }
  if (savingsType === 'fixed' && duration > config.duration.max) {
    throw new ApiError(400, `Maximum duration for ${savingsType} savings is ${config.duration.max} months (3 years)`);
  }

  // Calculate interest rate
  if (savingsType === 'fixed') {
    // Get interest rate based on duration tiers
    if (duration >= 24) {
      return config.interest['24mo'];
    }
    if (duration >= 12) {
      return config.interest['12mo'];
    }
    if (duration >= 6) {
      return config.interest['6mo'];
    }
    return config.interest['3mo'];
  }

  // For flexible savings: fixed rate
  return config.interest.rate;
};

/**
 * Create an interest-based savings package
 * @param {Object} ibInput - Interest-based savings package input
 * @returns {Promise<Object>} Result of the operation
 */
const createIbSavingsPackage = async (ibInput) => {
  const PackageModel = await IbSavingsPackage();
  const AccountModel = await Account();

  // 2. Fetch User Account and Branch Info
  const userAccount = await AccountModel.findOne({ accountNumber: ibInput.accountNumber }).select(
    '+phoneNumber +userId +branchId'
  );
  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  // Check if user has an active package
  const userPackageExist = await PackageModel.findOne({
    accountNumber: ibInput.accountNumber,
    status: 'open',
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  // Calculate interest rate based on type and duration
  const interestRate = calculateInterestRate(ibInput.savingsType, ibInput.duration);
  const startDate = new Date().getTime();
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + ibInput.duration);

  const createdPackage = await PackageModel.create({
    ...ibInput,
    userId: userAccount.userId,
    branchId: userAccount.branchId,
    maturityDate: maturityDate.getTime(),
    totalContribution: ibInput.initialDeposit || 0,
    initialDeposit: ibInput.initialDeposit || 0,
    status: 'open',
    startDate,
    interestRate,
  });

  // Send welcome SMS with interest rate tier information
  const phone = userAccount.phoneNumber;
  const message = `Congratulations! Your ${
    ibInput.savingsType
  } savings account has been created with ${interestRate}% interest rate for ${ibInput.duration} months. ${
    ibInput.initialDeposit ? `Initial deposit: ${ibInput.initialDeposit}` : ''
  }`;
  sendSms(phone, message).catch((error) => {
    logger.error(`Failed to send welcome SMS for package ${createdPackage._id}: ${error.message}`, {
      error,
      packageId: createdPackage._id,
      phone,
    });
  });

  return createdPackage;
};

module.exports = {
  createIbSavingsPackage,
};
