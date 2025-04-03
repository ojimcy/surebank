const httpStatus = require('http-status');
const paystackService = require('./paystack.service');
const ApiError = require('../utils/ApiError');
const dailySavingsService = require('./dailySavings.service');

/**
 * Initialize a payment transaction
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.email - Customer's email
 * @param {number} paymentData.amount - Amount to be paid in kobo
 * @param {string} paymentData.reference - Unique transaction reference
 * @param {string} paymentData.callback_url - Callback URL for payment verification
 * @param {string} paymentData.metadata - Additional payment metadata
 * @returns {Promise<Object>} Payment initialization response
 */
const initializePayment = async (paymentData) => {
  try {
    const response = await paystackService.initializeTransaction({
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference,
      callback_url: paymentData.callback_url,
      metadata: paymentData.metadata,
    });
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Failed to initialize payment');
  }
};

/**
 * Verify a payment transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Payment verification response
 */
const verifyPayment = async (reference) => {
  try {
    const response = await paystackService.verifyTransaction(reference);
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Failed to verify payment');
  }
};

/**
 * Initialize a daily savings contribution payment
 * @param {Object} contributionData - Contribution data
 * @param {string} contributionData.email - User's email
 * @param {string} contributionData.accountNumber - User's account number
 * @param {number} contributionData.amount - Amount to contribute in kobo
 * @param {string} contributionData.target - Savings target
 * @param {string} contributionData.callback_url - Callback URL for payment verification
 * @returns {Promise<Object>} Payment initialization response
 */
const initializeDailySavingsContribution = async (contributionData) => {
  try {
    // Validate the contribution amount and package
    const userPackage = await dailySavingsService.getUserPackage({
      accountNumber: contributionData.accountNumber,
      target: contributionData.target,
    });

    if (!userPackage) {
      throw new ApiError(404, 'No active savings package found for this account');
    }

    if (contributionData.amount % userPackage.amountPerDay !== 0) {
      throw new ApiError(400, `Amount must be a multiple of ${userPackage.amountPerDay}`);
    }

    if (contributionData.amount / userPackage.amountPerDay >= 30) {
      throw new ApiError(400, 'Amount exceeds maximum allowed contribution');
    }

    // Generate a unique reference for this transaction
    const reference = `DS_${Date.now()}_${contributionData.accountNumber}`;

    // Initialize the payment
    const paymentResponse = await paystackService.initializeTransaction({
      email: contributionData.email,
      amount: contributionData.amount,
      reference,
      callback_url: contributionData.callback_url,
      metadata: {
        type: 'ds_contribution',
        userId: userPackage.userId,
        packageId: userPackage._id,
        accountNumber: contributionData.accountNumber,
        target: contributionData.target,
        amountPerDay: userPackage.amountPerDay,
        contributionDays: contributionData.amount / userPackage.amountPerDay,
      },
    });

    return {
      ...paymentResponse,
      reference,
    };
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.BAD_REQUEST,
      error.message || 'Failed to initialize daily savings contribution'
    );
  }
};

/**
 * Handle successful daily savings contribution payment
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Result of the contribution
 */
const handleDailySavingsContribution = async (reference) => {
  try {
    // Verify the payment
    const payment = await verifyPayment(reference);

    if (payment.status !== 'success') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment not successful');
    }

    const { metadata } = payment;

    // Process the contribution
    const contributionResult = await dailySavingsService.saveDailyContribution({
      accountNumber: metadata.accountNumber,
      amount: payment.amount,
      target: metadata.target,
      createdBy: metadata.userId,
      packageId: metadata.packageId,
    });

    return {
      payment,
      contribution: contributionResult,
    };
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.BAD_REQUEST,
      error.message || 'Failed to process daily savings contribution'
    );
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  initializeDailySavingsContribution,
  handleDailySavingsContribution,
};
