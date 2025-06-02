const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const paystackService = require('./paystack.service');
const userService = require('./user.service');
const logger = require('../config/logger');
const { PaymentTransaction } = require('../models');
const { processPaystackContribution } = require('./dailySavings.service');
const { createPaymentMetadata } = require('./payment/helpers');
const { isMobileApp } = require('../config/mobile');

/**
 * Initialize a payment transaction
 * @param {Object} transactionData - The transaction data
 * @param {string} transactionData.email - Customer email
 * @param {number} transactionData.amount - Amount in Naira (will be converted to kobo)
 * @param {string} transactionData.callbackUrl - URL to redirect after payment (optional)
 * @param {string} transactionData.metadata - Additional transaction data (optional)
 * @param {string} transactionData.userId - User ID for the transaction
 * @param {boolean} skipCustomerCreation - Whether to skip the customer creation process
 * @returns {Promise<Object>} Transaction initialization response
 */
const initializeTransaction = async (transactionData, skipCustomerCreation = false) => {
  try {
    const { email, amount, callbackUrl, metadata = {}, userId } = transactionData;

    // Debug logging for transaction data
    logger.info('=== PAYSTACK INITIALIZATION DEBUG ===');
    logger.info('Transaction data received:', {
      email,
      amount,
      callbackUrl,
      metadata,
      userId,
      skipCustomerCreation,
    });

    // Determine prefix based on contributionType
    const { contributionType } = metadata;
    let prefix = 'gen'; // Default prefix if type is unknown
    if (contributionType === 'ds') {
      prefix = 'ds'; // Daily Savings
    } else if (contributionType === 'interest_savings') {
      prefix = 'ibs'; // Interest Savings
    } else if (contributionType === 'sb') {
      prefix = 'sb';
    }

    // Generate a unique reference using the determined prefix
    const reference = `${prefix}_${uuidv4()}`;

    // Convert amount to kobo (Paystack uses kobo not Naira)
    const amountInKobo = Math.round(amount * 100);

    // Ensure user has a Paystack customer record if userId is provided
    let customerCode = null;
    if (userId && !skipCustomerCreation) {
      try {
        const user = await userService.getUserById(userId);
        if (user) {
          const customer = await userService.ensurePaystackCustomer(user);
          if (customer && customer.status) {
            customerCode = customer.data.customer_code;
          }
        }
      } catch (error) {
        logger.warn(`Could not get/create Paystack customer for user ${userId}:`, error);
        // Continue without customer code if it fails
      }
    }

    // Build payment data
    const paymentData = {
      email,
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        custom_reference: reference,
        userId,
      },
    };

    // Add customer if available
    if (customerCode) {
      paymentData.customer = customerCode;
    }

    // Debug log what we're sending to Paystack
    logger.info('Paystack initialization params:', {
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference,
      callback_url: paymentData.callback_url,
      metadata: paymentData.metadata,
      customer: paymentData.customer || 'none',
    });

    const response = await paystackService.initializeTransaction(paymentData);

    if (!response || !response.status) {
      logger.error('Paystack initialization failed:', response);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment initialization failed');
    }

    // Debug log Paystack response
    logger.info('Paystack response received:', {
      status: response.status,
      reference: response.data && response.data.reference,
      authorization_url: response.data && response.data.authorization_url,
      access_code: response.data && response.data.access_code,
    });
    logger.info('=== PAYSTACK INITIALIZATION DEBUG END ===');

    return {
      success: true,
      data: {
        authorization_url: response.data.authorization_url,
        reference,
        access_code: response.data.access_code,
      },
    };
  } catch (error) {
    logger.error('Payment initialization error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to initialize payment'
    );
  }
};

/**
 * Generic payment initialization for all package types
 * @param {Object} data - Payment data
 * @param {string} data.userId - User ID
 * @param {string} data.packageId - Package ID (optional for interest packages)
 * @param {number} data.amount - Amount to pay
 * @param {string} data.contributionType - Type: 'daily_savings', 'savings_buying', 'interest_package'
 * @param {Object} data.packageData - Additional package-specific data (for interest packages)
 * @param {string} data.callbackUrl - Optional callback URL
 * @returns {Promise<Object>} Payment initialization response
 */
const initializePaymentContribution = async (data, req = null) => {
  const { userId, packageId, amount, contributionType, packageData = {}, callbackUrl } = data;

  // Add mobile context to package data if request object is available
  if (req) {
    packageData.isMobileApp = isMobileApp(req);
  }

  // Common validation
  if (!userId || !amount || !contributionType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID, Amount, and Contribution Type are required.');
  }

  // Get user details
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Create payment metadata directly
  const metadata = createPaymentMetadata(userId, packageId, packageData, contributionType);

  // For interest packages, don't use hardcoded callback URL - let Paystack handle default behavior
  const finalCallbackUrl = callbackUrl;

  const transactionData = {
    email: user.email,
    amount,
    callbackUrl: finalCallbackUrl,
    metadata,
    userId,
  };

  // Use skipCustomerCreation for interest packages
  const skipCustomerCreation = contributionType === 'interest_package';

  return initializeTransaction(transactionData, skipCustomerCreation);
};

/**
 * Initialize a Daily Savings Contribution via Paystack
 * @deprecated Use initializePaymentContribution with contributionType: 'daily_savings' instead
 * @param {Object} contributionData
 * @param {string} contributionData.userId - User initiating the contribution
 * @param {string} contributionData.packageId - Target Daily Savings package ID
 * @param {number} contributionData.amount - Amount to contribute
 * @param {string} [contributionData.callbackUrl] - Optional callback URL
 * @returns {Promise<Object>} Paystack initialization response
 */
const initializeDailySavingsContribution = async (contributionData) => {
  // Use the new unified function for backward compatibility
  return initializePaymentContribution({
    ...contributionData,
    contributionType: 'daily_savings',
  });
};

/**
 * Initialize a Savings-Buying Contribution via Paystack
 * @deprecated Use initializePaymentContribution with contributionType: 'savings_buying' instead
 * @param {Object} contributionData
 * @param {string} contributionData.userId - User initiating the contribution
 * @param {string} contributionData.packageId - Target SB package ID
 * @param {number} contributionData.amount - Amount to contribute
 * @param {string} [contributionData.callbackUrl] - Optional callback URL
 * @returns {Promise<Object>} Paystack initialization response
 */
const initializeSbContribution = async (contributionData) => {
  // Use the new unified function for backward compatibility
  return initializePaymentContribution({
    ...contributionData,
    contributionType: 'savings_buying',
  });
};

/**
 * Initiate payment for interest-based savings package
 * @deprecated Use initializePaymentContribution with contributionType: 'interest_package' instead
 * @param {Object} packageData - Interest package input data
 * @returns {Promise<Object>} Payment initialization response
 */
const initiateInterestPackagePayment = async (packageData) => {
  // Use the new unified function for backward compatibility
  return initializePaymentContribution({
    userId: packageData.userId,
    amount: packageData.principalAmount,
    contributionType: 'interest_package',
    packageData,
    callbackUrl: packageData.callbackUrl,
  });
};

/**
 * Verify a payment transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Verification response
 */
const verifyTransaction = async (reference) => {
  try {
    if (!reference) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction reference is required');
    }

    // Query Paystack API to confirm transaction status
    const response = await paystackService.verifyTransaction(reference);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed');
    }

    // Check if transaction status is successful
    const isVerified = response.data.status === 'success';

    // Get transaction data from our database
    const PaymentTransactionModel = await PaymentTransaction();

    // Check if we already have this transaction recorded
    let transaction = await PaymentTransactionModel.findOne({ reference });
    const isNewTransaction = !transaction;

    if (transaction) {
      // Update the transaction status if it has changed
      if (transaction.status !== response.data.status && transaction.status !== 'processed') {
        // Don't re-update if already processed
        transaction.status = response.data.status;
        transaction.lastVerificationDate = new Date();
        transaction.verificationAttempts += 1;
        transaction.gatewayResponse = response.data.gateway_response;
        // Only save here if not processing contribution below
        // await transaction.save();
      }
    } else {
      // Create a new transaction record if it doesn't exist
      transaction = new PaymentTransactionModel({
        // Use 'new' instead of 'create' to control saving
        reference: response.data.reference,
        amount: response.data.amount / 100, // Convert from kobo to Naira
        status: response.data.status,
        channel: response.data.channel,
        currency: response.data.currency,
        paymentGateway: 'paystack',
        gatewayReference: response.data.id.toString(),
        gatewayResponse: response.data.gateway_response,
        userId: response.data.metadata.userId, // Get from metadata if available
        packageId: response.data.metadata.packageId, // Get from metadata if available
        metadata: response.data.metadata,
        verificationAttempts: 1,
        lastVerificationDate: new Date(),
        paymentDate: new Date(response.data.paid_at),
      });
    }

    // Process payment based on status (if successful) and if not already processed
    // Check metadata for packageId and ensure status is success and not already processed by us
    if (isVerified && transaction.status !== 'processed' && response.data.metadata && response.data.metadata.packageId) {
      const { packageId, contributionType, userId } = response.data.metadata;
      const amount = response.data.amount / 100; // Convert to Naira

      logger.info(`Payment verified: Ref ${reference}, Type: ${contributionType}, Package: ${packageId}, Amount: ${amount}`);

      try {
        // Use a flag or status on the transaction to prevent reprocessing
        if (contributionType === 'daily_savings') {
          // Call the daily savings service to handle crediting the package
          await processPaystackContribution(packageId, amount, userId, reference, transaction.paymentDate);
          logger.info(`Successfully processed Daily Savings contribution for package ${packageId}`);
          transaction.status = 'processed'; // Mark as processed in our system
        }
        // TODO: Add handlers for other contribution types (SB, Interest) here using else if
        // else if (contributionType === 'sb_package') { ... }

        transaction.lastVerificationDate = new Date(); // Update verification time even if already existed
        await transaction.save(); // Save transaction changes (new or updated status)
      } catch (processingError) {
        logger.error(`Error processing contribution for reference ${reference}, package ${packageId}:`, processingError);
        // Don't change transaction status, allow retry? Or set to 'failed_processing'?
        // For now, save the transaction with its current 'success' status from Paystack, but log the processing error.
        if (isNewTransaction || transaction.isModified()) {
          // Save if new or status changed before error
          await transaction.save();
        }
        // Re-throw or handle depending on desired retry mechanism
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to process contribution: ${processingError.message}`);
      }
    } else if (transaction.isModified() || isNewTransaction) {
      // Save transaction if it's new or status was updated (and not processed above)
      await transaction.save();
    }

    return {
      success: true,
      verified: isVerified,
      status: response.data.status,
      amount: response.data.amount / 100, // Convert back to Naira
      reference: response.data.reference,
      transactionId: transaction._id, // Return our internal transaction ID
      transactionData: response.data,
    };
  } catch (error) {
    logger.error('Payment verification error:', error);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to verify payment');
  }
};

/**
 * Get transaction history
 * @param {Object} filters - Transaction filters
 * @param {number} filters.perPage - Items per page
 * @param {number} filters.page - Page number
 * @returns {Promise<Array>} List of transactions
 */
const getTransactionHistory = async (filters = {}) => {
  try {
    const response = await paystackService.listTransactions(filters);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to retrieve transaction history');
    }

    // Transform for consistency
    const transactions = response.data.data.map((transaction) => ({
      id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount / 100, // Convert to Naira
      status: transaction.status,
      customer: {
        email: transaction.customer.email,
        name: `${transaction.customer.first_name} ${transaction.customer.last_name}`,
      },
      createdAt: transaction.created_at,
      paidAt: transaction.paid_at,
    }));

    return {
      success: true,
      transactions,
      meta: {
        total: response.data.meta.total,
        totalPages: Math.ceil(response.data.meta.total / response.data.meta.perPage),
        perPage: response.data.meta.perPage,
        page: response.data.meta.page,
      },
    };
  } catch (error) {
    logger.error('Get transaction history error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to get transaction history'
    );
  }
};

/**
 * Create transfer recipient (for withdrawals)
 * @param {Object} recipientData - Recipient data
 * @param {string} recipientData.name - Recipient name
 * @param {string} recipientData.accountNumber - Bank account number
 * @param {string} recipientData.bankCode - Bank code
 * @param {string} recipientData.currency - Currency code (default: NGN)
 * @returns {Promise<Object>} Recipient creation response
 */
const createTransferRecipient = async (recipientData) => {
  try {
    const { name, accountNumber, bankCode, currency = 'NGN' } = recipientData;

    if (!name || !accountNumber || !bankCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Recipient name, account number, and bank code are required');
    }

    const data = {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
    };

    const response = await paystackService.createTransferRecipient(data);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create transfer recipient');
    }

    return {
      success: true,
      recipientCode: response.data.recipient_code,
      recipientData: response.data,
    };
  } catch (error) {
    logger.error('Create transfer recipient error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to create transfer recipient'
    );
  }
};

/**
 * Initiate a transfer (withdrawal to bank account)
 * @param {Object} transferData - Transfer data
 * @param {string} transferData.amount - Amount in Naira
 * @param {string} transferData.recipientCode - Recipient code
 * @param {string} transferData.reason - Transfer reason
 * @returns {Promise<Object>} Transfer response
 */
const initiateTransfer = async (transferData) => {
  try {
    const { amount, recipientCode, reason } = transferData;

    if (!amount || !recipientCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Transfer amount and recipient code are required');
    }

    const amountInKobo = Math.round(amount * 100);

    const data = {
      source: 'balance',
      amount: amountInKobo,
      recipient: recipientCode,
      reason: reason || 'Withdrawal',
    };

    const response = await paystackService.initiateTransfer(data);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to initiate transfer');
    }

    return {
      success: true,
      transferCode: response.data.transfer_code,
      reference: response.data.reference,
      transferData: response.data,
    };
  } catch (error) {
    logger.error('Initiate transfer error:', error);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to initiate transfer');
  }
};

/**
 * Resolve a bank account number
 * @param {string} accountNumber - Account number to resolve
 * @param {string} bankCode - Bank code
 * @returns {Promise<Object>} Account resolution response
 */
const resolveBankAccount = async (accountNumber, bankCode) => {
  try {
    if (!accountNumber || !bankCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Account number and bank code are required');
    }

    // Use the Paystack client directly for this operation
    const response = await paystackService.paystackClient.verification.resolveAccount({
      account_number: accountNumber,
      bank_code: bankCode,
    });

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to resolve bank account');
    }

    return {
      success: true,
      accountName: response.data.account_name,
      accountNumber: response.data.account_number,
      bankId: response.data.bank_id,
      accountData: response.data,
    };
  } catch (error) {
    logger.error('Resolve bank account error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to resolve bank account'
    );
  }
};

/**
 * Get list of banks
 * @param {string} country - Country code (default: nigeria)
 * @returns {Promise<Array>} List of banks
 */
const getBanks = async (country = 'nigeria') => {
  try {
    const response = await paystackService.paystackClient.misc.listBanks({ country });

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get banks list');
    }

    return {
      success: true,
      banks: response.data.map((bank) => ({
        id: bank.id,
        name: bank.name,
        code: bank.code,
        active: bank.active,
      })),
    };
  } catch (error) {
    logger.error('Get banks error:', error);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to get banks list');
  }
};

/**
 * Get payment status by reference
 * @param {string} reference - Transaction reference
 * @param {string} userId - User ID (for security validation)
 * @returns {Promise<Object>} Payment status response
 */
const getPaymentStatus = async (reference, userId = null) => {
  try {
    if (!reference) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction reference is required');
    }

    // Get the PaymentTransaction model
    const PaymentTransactionModel = await PaymentTransaction();

    // Find payment by reference
    const payment = await PaymentTransactionModel.findOne({ reference }).lean();

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    // If userId is provided, verify ownership
    if (userId && payment.userId && payment.userId.toString() !== userId.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view this payment');
    }

    // Transform the response to match the expected format
    return {
      success: true,
      reference: payment.reference,
      status: payment.status,
      amount: payment.amount,
      packageId: payment.packageId,
      packageType: payment.metadata && payment.metadata.contributionType ? payment.metadata.contributionType : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      metadata: payment.metadata,
    };
  } catch (error) {
    logger.error('Get payment status error:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to get payment status'
    );
  }
};

module.exports = {
  initializeTransaction,
  initializePaymentContribution,
  initializeDailySavingsContribution,
  initializeSbContribution,
  initiateInterestPackagePayment,
  verifyTransaction,
  getTransactionHistory,
  createTransferRecipient,
  initiateTransfer,
  resolveBankAccount,
  getBanks,
  getPaymentStatus,
};
