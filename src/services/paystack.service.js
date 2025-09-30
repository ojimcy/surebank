const Paystack = require('paystack-api');
const axios = require('axios');
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
const makePaystackRequest = async (endpoint, data) => {
  const baseUrl = config.paystack.baseUrl || 'https://api.paystack.co';
  return axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      'Content-Type': 'application/json',
    },
  });
};

const createTransferRecipient = async (data) => {
  try {
    const response = await makePaystackRequest('/transferrecipient', data);
    logger.info('Transfer recipient created successfully');
    return response.data;
  } catch (error) {
    const errorMessage = error.response && error.response.data ? error.response.data : error.message;
    logger.error('Error creating transfer recipient:', errorMessage);
    throw error;
  }
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
  try {
    const response = await makePaystackRequest('/transfer', data);
    const reference = response.data.data && response.data.data.reference ? response.data.data.reference : 'unknown';
    logger.info(`Transfer initiated with reference: ${reference}`);
    return response.data;
  } catch (error) {
    const errorData = error.response && error.response.data ? error.response.data : error.message;
    logger.error('Error initiating transfer:', errorData);
    throw error;
  }
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

/**
 * Charge an authorization code for recurring payments
 * @param {Object} data - Charge data
 * @param {string} data.authorization_code - Authorization code from previous transaction
 * @param {string} data.email - Customer email
 * @param {number} data.amount - Amount in kobo
 * @param {string} data.reference - Unique transaction reference
 * @param {Object} data.metadata - Additional transaction metadata
 * @returns {Promise<Object>} Charge response
 */
const chargeAuthorization = async (data) => {
  try {
    logger.info(`Charging authorization code: ${data.authorization_code} for amount: ${data.amount}`);

    // Use direct HTTP API call since the paystack-api package method might not exist
    const response = await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      data,
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data;
    logger.info(`Authorization charge response: ${result.status ? 'Success' : 'Failed'}`);
    
    return result;
  } catch (error) {
    const errorMessage = error.response && error.response.data ? error.response.data : error.message;
    logger.error('Error charging authorization:', errorMessage);
    throw error;
  }
};

/**
 * Validate an authorization code to ensure it's still valid
 * @param {string} authorizationCode - Authorization code to validate
 * @param {string} email - Customer email
 * @param {number} amount - Amount in kobo (small amount for validation)
 * @returns {Promise<Object>} Validation response
 */
const validateAuthorization = async (authorizationCode, email, amount = 100) => {
  try {
    const data = {
      authorization_code: authorizationCode,
      email,
      amount,
    };

    const response = await paystackClient.transaction.checkAuthorization(data);

    logger.info(`Authorization validation for ${authorizationCode}: ${response.status ? 'Valid' : 'Invalid'}`);
    return response;
  } catch (error) {
    logger.error('Error validating authorization:', error);
    throw error;
  }
};

/**
 * Get authorization details from a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Authorization details
 */
const getTransactionAuthorization = async (transactionId) => {
  try {
    const response = await paystackClient.transaction.get({ id: transactionId });

    if (response.status && response.data.authorization) {
      return {
        status: true,
        data: response.data.authorization,
      };
    }

    throw new Error('No authorization found for transaction');
  } catch (error) {
    logger.error(`Error getting authorization for transaction ${transactionId}:`, error);
    throw error;
  }
};

/**
 * List customer authorizations
 * @param {string} customerCode - Customer code
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of authorizations
 */
const listCustomerAuthorizations = async (customerCode, options = {}) => {
  try {
    const response = await paystackClient.customer.getAuthorizations({
      customer: customerCode,
      ...options,
    });

    return response;
  } catch (error) {
    logger.error(`Error listing authorizations for customer ${customerCode}:`, error);
    throw error;
  }
};

/**
 * Deactivate an authorization code
 * @param {string} authorizationCode - Authorization code to deactivate
 * @returns {Promise<Object>} Deactivation response
 */
const deactivateAuthorization = async (authorizationCode) => {
  try {
    const response = await makePaystackRequest('/customer/deactivate_authorization', {
      authorization_code: authorizationCode,
    });

    logger.info(`Authorization ${authorizationCode} deactivated successfully`);
    return response.data;
  } catch (error) {
    logger.error(`Error deactivating authorization ${authorizationCode}:`, error);
    throw error;
  }
};

/**
 * Check if an authorization is reusable
 * @param {Object} authorization - Authorization object
 * @returns {boolean} Whether the authorization is reusable
 */
const isAuthorizationReusable = (authorization) => {
  return authorization && authorization.reusable === true;
};

/**
 * Get card details from authorization
 * @param {Object} authorization - Authorization object
 * @returns {Object} Card details
 */
const getCardDetailsFromAuthorization = (authorization) => {
  if (!authorization) {
    throw new Error('Authorization object is required');
  }

  return {
    authorizationCode: authorization.authorization_code,
    cardType: authorization.card_type,
    last4: authorization.last4,
    expiryMonth: authorization.exp_month,
    expiryYear: authorization.exp_year,
    bank: authorization.bank,
    signature: authorization.signature,
    reusable: authorization.reusable,
  };
};

/**
 * List banks from Paystack
 * @param {Object} options - Query options
 * @param {string} options.country - Country code (default: 'nigeria')
 * @param {number} options.perPage - Number of records per page
 * @param {string} options.currency - Currency code (default: 'NGN')
 * @returns {Promise<Object>} List of banks
 */
const listBanks = async (options = {}) => {
  try {
    const params = {
      country: options.country || 'nigeria',
      perPage: options.perPage || 100,
      ...options,
    };
    const response = await paystackClient.misc.listBanks(params);
    logger.info(`Listed ${response.data.data ? response.data.data.length : 0} banks from Paystack`);
    return response;
  } catch (error) {
    logger.error('Error listing banks from Paystack:', error);
    throw error;
  }
};

/**
 * Resolve bank account number to get account details
 * @param {Object} data - Account data
 * @param {string} data.account_number - Account number to resolve
 * @param {string} data.bank_code - Bank code
 * @returns {Promise<Object>} Account details including account name
 */
const resolveBankAccount = async (data) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank/resolve', {
      params: {
        account_number: data.account_number,
        bank_code: data.bank_code,
      },
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info(`Resolved account ${data.account_number} at bank ${data.bank_code}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response && error.response.data ? error.response.data : error.message;
    logger.error('Error resolving bank account:', errorMessage);
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
  chargeAuthorization,
  validateAuthorization,
  getTransactionAuthorization,
  listCustomerAuthorizations,
  deactivateAuthorization,
  isAuthorizationReusable,
  getCardDetailsFromAuthorization,
  listBanks,
  resolveBankAccount,
};
