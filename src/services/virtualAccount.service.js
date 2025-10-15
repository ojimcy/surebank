const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const { VirtualAccount, User } = require('../models');
const ApiError = require('../utils/ApiError');
const paystackService = require('./paystack.service');
const userService = require('./user.service');
const logger = require('../config/logger');

/**
 * Create a virtual account for a user via Paystack
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created virtual account
 */
const createVirtualAccount = async (userId) => {
  try {
    const VirtualAccountModel = await VirtualAccount();
    const UserModel = await User();

    // Check if user already has a virtual account
    const existingAccount = await VirtualAccountModel.findOne({ userId, status: { $in: ['active', 'pending'] } });
    if (existingAccount) {
      return existingAccount;
    }

    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }


    // Generate a unique reference
    const reference = `va_${uuidv4()}`;

    // Ensure user has a Paystack customer record
    let customerCode = null;
    try {
      const customer = await userService.ensurePaystackCustomer(user);
      if (customer && customer.status) {
        customerCode = customer.data.customer_code;
      }
    } catch (error) {
      logger.warn(`Could not ensure Paystack customer for virtual account creation (user ${userId}):`, error);
      // Continue without customer code if it fails
    }

    // Prepare payload for virtual account creation
    const payload = {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phoneNumber,
      preferred_bank: 'wema-bank', // Can be configurable or based on user preference
    };

    // Add customer code if available
    if (customerCode) {
      payload.customer = customerCode;
    }

    // Call Paystack to create a dedicated virtual account
    const response = await paystackService.createDedicatedVirtualAccount(payload);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create virtual account');
    }

    // Create virtual account record
    const virtualAccount = {
      userId,
      accountNumber: response.data.dedicated_account.account_number,
      accountName: response.data.dedicated_account.account_name,
      bankName: response.data.dedicated_account.bank.name,
      bankCode: response.data.dedicated_account.bank.code,
      reference,
      status: 'active',
      provider: 'paystack',
      gatewayResponse: JSON.stringify(response.data),
      isKycVerified: true,
      metadata: {
        paystack_customer_id: response.data.customer.customer_code,
        dedicated_account_id: response.data.dedicated_account.id,
      },
    };

    // Save to database
    const createdAccount = await VirtualAccountModel.create(virtualAccount);

    // Update user with Paystack customer ID if not already set
    if (response.data.customer.customer_code && !user.paystackCustomerId) {
      await UserModel.findByIdAndUpdate(userId, {
        paystackCustomerId: response.data.customer.customer_code,
      });
    }

    return createdAccount;
  } catch (error) {
    logger.error('Virtual account creation error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to create virtual account'
    );
  }
};

/**
 * Get a user's virtual account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's virtual account
 */
const getUserVirtualAccount = async (userId) => {
  try {
    const VirtualAccountModel = await VirtualAccount();

    const account = await VirtualAccountModel.findOne({
      userId,
      status: 'active',
    });

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No active virtual account found for this user');
    }

    return account;
  } catch (error) {
    logger.error('Get virtual account error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to retrieve virtual account'
    );
  }
};

/**
 * Deactivate a user's virtual account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated virtual account
 */
const deactivateVirtualAccount = async (userId) => {
  try {
    const VirtualAccountModel = await VirtualAccount();

    const account = await VirtualAccountModel.findOne({
      userId,
      status: 'active',
    });

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No active virtual account found for this user');
    }

    // For Paystack, we might want to call their API to deactivate if they have such an endpoint
    // For now, we'll just update our database

    account.status = 'inactive';
    await account.save();

    return account;
  } catch (error) {
    logger.error('Deactivate virtual account error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to deactivate virtual account'
    );
  }
};

/**
 * Create virtual account for a user after KYC approval
 * This is used by KYC service when a user's KYC is approved
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created virtual account
 */
const createVirtualAccountAfterKyc = async (userId) => {
  try {
    return await createVirtualAccount(userId);
  } catch (error) {
    // Log error but don't throw, to avoid breaking KYC flow
    logger.error(`Failed to create virtual account after KYC for user ${userId}:`, error);
    return null;
  }
};

module.exports = {
  createVirtualAccount,
  getUserVirtualAccount,
  deactivateVirtualAccount,
  createVirtualAccountAfterKyc,
};
