const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${config.paystack.secretKey}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Create a customer
 * @param {Object} data - Customer data
 * @returns {Promise<Object>} Created customer
 */
const createCustomer = async (data) => {
  const response = await paystack.post('/customer', data);
  return response.data.data;
};

/**
 * Create a dedicated virtual account
 * @param {Object} data - Virtual account data
 * @param {string} data.customer - Customer's email or name
 * @param {string} data.bvn - Customer's BVN
 * @param {string} data.account_number - Customer's account number
 * @param {string} data.bank_code - Bank code (e.g., '057' for Zenith Bank)
 * @returns {Promise<Object>} Created virtual account
 */
const createDedicatedVirtualAccount = async (data) => {
  try {
    const response = await paystack.post('/dedicated_account', {
      customer: data.customer,
      bvn: data.bvn,
      account_number: data.account_number,
      bank_code: data.bank_code,
    });

    return response.data.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.data.message || 'Failed to create virtual account');
  }
};

/**
 * Get dedicated virtual account details
 * @param {string} dedicatedAccountId - Dedicated account ID
 * @returns {Promise<Object>} Virtual account details
 */
const getDedicatedVirtualAccount = async (dedicatedAccountId) => {
  try {
    const response = await paystack.get(`/dedicated_account/${dedicatedAccountId}`);
    return response.data.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.data.message || 'Failed to get virtual account details');
  }
};

/**
 * List dedicated virtual accounts
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of virtual accounts
 */
const listDedicatedVirtualAccounts = async (options = {}) => {
  try {
    const response = await paystack.get('/dedicated_account', { params: options });
    return response.data.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.response.data.message || 'Failed to list virtual accounts');
  }
};

/**
 * Verify BVN
 * @param {string} bvn - Customer's BVN
 * @returns {Promise<Object>} Verified BVN
 */
const verifyBvn = async (bvn) => {
  try {
    const response = await paystack.post('/bvn/verify', {
      bvn,
    });
    return response.data.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message || 'Failed to verify BVN');
  }
};

/**
 * Initialize a transaction
 * @param {Object} data - Transaction data
 * @param {string} data.email - Customer's email
 * @param {number} data.amount - Amount in kobo
 * @param {string} data.reference - Transaction reference
 * @param {string} data.callback_url - Callback URL
 * @param {Object} data.metadata - Additional metadata
 * @returns {Promise<Object>} Transaction initialization response
 */
const initializeTransaction = async (data) => {
  try {
    const response = await paystack.post('/transaction/initialize', {
      email: data.email,
      amount: data.amount,
      reference: data.reference,
      callback_url: data.callback_url,
      metadata: data.metadata,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response && error.response.data ? error.response.data.message : 'Failed to initialize transaction';
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

/**
 * Verify a transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction verification response
 */
const verifyTransaction = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error) {
    const errorMessage =
      error.response && error.response.data ? error.response.data.message : 'Failed to verify transaction';
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

module.exports = {
  createCustomer,
  createDedicatedVirtualAccount,
  getDedicatedVirtualAccount,
  listDedicatedVirtualAccounts,
  verifyBvn,
  initializeTransaction,
  verifyTransaction,
};
