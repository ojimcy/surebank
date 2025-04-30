const Paystack = require('paystack-api');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Initialize Paystack with API keys from config
 */
const paystackClient = Paystack(config.paystack.secretKey);

/**
 * Verify Paystack initialization by making a test API call
 * @returns {Promise<boolean>} True if verification succeeds
 */
const verifyPaystackInitialization = async () => {
  try {
    // Make a simple API call to verify connectivity
    const response = await paystackClient.misc.listBanks({ country: 'nigeria' });
    return response && response.status;
  } catch (error) {
    logger.error('Paystack initialization verification failed', error);
    return false;
  }
};

/**
 * Initialize a transaction
 * @param {Object} data - Transaction data
 * @param {string} data.email - Customer email
 * @param {number} data.amount - Amount in kobo (multiply Naira by 100)
 * @param {string} data.reference - Unique transaction reference (optional)
 * @param {string} data.callback_url - URL to redirect to after payment (optional)
 * @returns {Promise<Object>} Transaction response
 */
const initializeTransaction = async (data) => {
  return paystackClient.transaction.initialize(data);
};

/**
 * Verify a transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Verification response
 */
const verifyTransaction = async (reference) => {
  try {
    // Validate the reference before proceeding
    if (!reference || typeof reference !== 'string') {
      logger.error(`Invalid transaction reference: ${reference}`);
      throw new Error('Transaction reference must be a valid string');
    }

    // Create verification params object to avoid 'in' operator issues
    const params = { reference };
    const response = await paystackClient.transaction.verify(params);

    // Log verification attempt for debugging
    logger.info(`Transaction verification for reference ${reference}: ${response.status ? 'Success' : 'Failed'}`);

    return response;
  } catch (error) {
    logger.error(`Transaction verification error for reference ${reference}:`, error);
    throw error;
  }
};

/**
 * List transactions with optional filtering
 * @param {Object} options - List options
 * @param {number} options.perPage - Number of records per page
 * @param {number} options.page - Page number
 * @param {string} options.from - Start date (YYYY-MM-DD)
 * @param {string} options.to - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Transaction list response
 */
const listTransactions = async (options = {}) => {
  return paystackClient.transaction.list(options);
};

/**
 * Create a transfer recipient for bank transfers
 * @param {Object} data - Recipient data
 * @param {string} data.type - Type of recipient (nuban, mobile_money, etc.)
 * @param {string} data.name - Recipient name
 * @param {string} data.account_number - Bank account number
 * @param {string} data.bank_code - Bank code
 * @param {string} data.currency - Currency code (default: NGN)
 * @returns {Promise<Object>} Recipient creation response
 */
const createTransferRecipient = async (data) => {
  return paystackClient.transferrecipient.create(data);
};

/**
 * Initiate a transfer to a recipient
 * @param {Object} data - Transfer data
 * @param {string} data.source - Source of funds (balance)
 * @param {string} data.amount - Amount in kobo
 * @param {string} data.recipient - Recipient code
 * @param {string} data.reason - Reason for transfer
 * @returns {Promise<Object>} Transfer response
 */
const initiateTransfer = async (data) => {
  return paystackClient.transfer.create(data);
};

/**
 * Create a dedicated virtual account for a customer
 * @param {Object} data - Virtual account data
 * @param {string} data.email - Customer email
 * @param {string} data.first_name - Customer first name
 * @param {string} data.last_name - Customer last name
 * @param {string} data.phone - Customer phone
 * @param {string} data.preferred_bank - Preferred bank (optional)
 * @returns {Promise<Object>} Virtual account response
 */
const createDedicatedVirtualAccount = async (data) => {
  try {
    // Create dedicated virtual account using Paystack
    return await paystackClient.dedicatedVirtualAccount.create(data);
  } catch (error) {
    logger.error('Error creating dedicated virtual account:', error);
    throw error;
  }
};

/**
 * List dedicated virtual accounts for a customer
 * @param {Object} options - List options
 * @param {string} options.customer - Customer ID or code
 * @param {number} options.page - Page number
 * @param {number} options.perPage - Number of records per page
 * @returns {Promise<Object>} Virtual account list response
 */
const listDedicatedVirtualAccounts = async (options = {}) => {
  return paystackClient.dedicatedVirtualAccount.list(options);
};

/**
 * Deactivate a dedicated virtual account
 * @param {string} dedicatedAccountId - Dedicated account ID from Paystack
 * @returns {Promise<Object>} Deactivation response
 */
const deactivateDedicatedVirtualAccount = async (dedicatedAccountId) => {
  return paystackClient.dedicatedVirtualAccount.deactivate({
    dedicated_account_id: dedicatedAccountId,
  });
};

/**
 * Requery a transaction to confirm its status
 * This is useful for verifying webhook events or double-checking transaction status
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction details
 */
const requeryTransaction = async (reference) => {
  try {
    // Validate the reference before proceeding
    if (!reference || typeof reference !== 'string') {
      logger.error(`Invalid transaction reference for requery: ${reference}`);
      throw new Error('Transaction reference must be a valid string');
    }

    // Create verification params object to avoid 'in' operator issues
    const params = { reference };
    const response = await paystackClient.transaction.verify(params);

    // Log verification attempt for monitoring
    logger.info(`Transaction requery for reference ${reference}: ${response.status ? 'Success' : 'Failed'}`);

    return response;
  } catch (error) {
    logger.error(`Transaction requery error for reference ${reference}:`, error);
    throw error;
  }
};

/**
 * Create a customer in Paystack
 * @param {Object} data - Customer data
 * @param {string} data.email - Customer email (required)
 * @param {string} data.first_name - Customer first name (optional)
 * @param {string} data.last_name - Customer last name (optional)
 * @param {string} data.phone - Customer phone number (optional)
 * @param {string} data.metadata - Additional customer data (optional)
 * @returns {Promise<Object>} Customer creation response
 */
const createCustomer = async (data) => {
  try {
    return await paystackClient.customer.create(data);
  } catch (error) {
    logger.error('Error creating Paystack customer:', error);
    throw error;
  }
};

/**
 * List customers from Paystack
 * @param {Object} options - Query options
 * @param {number} options.perPage - Number of records per page
 * @param {number} options.page - Page number
 * @param {string} options.from - Start date (YYYY-MM-DD)
 * @param {string} options.to - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} List customers response
 */
const listCustomers = async (options = {}) => {
  return paystackClient.customer.list(options);
};

/**
 * Fetch a customer by email or code
 * @param {string} identifier - Customer email or code
 * @returns {Promise<Object>} Customer data
 */
const fetchCustomer = async (identifier) => {
  try {
    // If this looks like an email, we need to list customers and filter
    if (identifier.includes('@')) {
      // Search for customer by email using list endpoint
      const customers = await paystackClient.customer.list({
        email: identifier,
        perPage: 1,
      });

      if (customers && customers.status && customers.data.data.length > 0) {
        return {
          status: true,
          data: customers.data.data[0],
        };
      }
      throw new Error(`Customer with email ${identifier} not found`);
    }

    // Otherwise use the get endpoint with the customer code/ID
    return paystackClient.customer.get({ id: identifier });
  } catch (error) {
    logger.error(`Error fetching Paystack customer ${identifier}:`, error);
    throw error;
  }
};

module.exports = {
  paystackClient,
  verifyPaystackInitialization,
  initializeTransaction,
  verifyTransaction,
  listTransactions,
  createTransferRecipient,
  initiateTransfer,
  createDedicatedVirtualAccount,
  listDedicatedVirtualAccounts,
  deactivateDedicatedVirtualAccount,
  requeryTransaction,
  createCustomer,
  listCustomers,
  fetchCustomer,
};
