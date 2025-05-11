const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const paystackService = require('./paystack.service');
const userService = require('./user.service');
const logger = require('../config/logger');
const { PaymentTransaction } = require('../models');
const { getDailySavingsPackageById, processPaystackContribution } = require('./dailySavings.service');
const { getUserAccount } = require('./account.service');
const config = require('../config/config');

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

    const response = await paystackService.initializeTransaction(paymentData);

    if (!response || !response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment initialization failed');
    }

    return {
      success: true,
      reference,
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      paymentData: response.data,
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
 * Initialize a Daily Savings Contribution via Paystack
 * @param {Object} contributionData
 * @param {string} contributionData.userId - User initiating the contribution
 * @param {string} contributionData.packageId - Target Daily Savings package ID
 * @param {number} contributionData.amount - Amount to contribute
 * @param {string} [contributionData.callbackUrl] - Optional callback URL
 * @returns {Promise<Object>} Paystack initialization response
 */
const initializeDailySavingsContribution = async (contributionData) => {
  const { userId, packageId, amount, callbackUrl } = contributionData;

  if (!userId || !packageId || !amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID, Package ID, and Amount are required.');
  }

  // Fetch user details (for email) and package details (optional validation)
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Optional: Fetch package to ensure it exists before initializing
  const userPackage = await getDailySavingsPackageById(packageId);
  if (!userPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Daily Savings package not found');
  }

  const metadata = {
    userId,
    packageId,
    contributionType: 'ds', // Identify the type of contribution
    custom_fields: [
      // Example Paystack standard metadata
      {
        display_name: 'Package ID',
        variable_name: 'package_id',
        value: packageId,
      },
      {
        display_name: 'Contribution Type',
        variable_name: 'contribution_type',
        value: 'Daily Savings',
      },
    ],
  };

  const transactionData = {
    email: user.email,
    amount,
    callbackUrl,
    metadata,
    userId, // Pass userId for customer linking in initializeTransaction
  };

  // Call the generic initialization function
  return initializeTransaction(transactionData);
};

/**
 * Initiate payment for interest-based savings package
 * @param {Object} packageData - Interest package input data
 * @returns {Promise<Object>} Payment initialization response
 */
const initiateInterestPackagePayment = async (packageData) => {
  // Get user's account from userId to verify it exists
  const userAccount = await getUserAccount(packageData.userId, 'ibs');
  if (!userAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found. Please create one to continue.');
  }

  // Get user details to retrieve email
  const user = await userService.getUserById(packageData.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User email is required but not found');
  }

  // Use the configured callback URL from config if not provided in the request
  const callbackUrl = packageData.callbackUrl || config.paystack.callbackUrl;

  if (!callbackUrl) {
    logger.warn('No callback URL provided for initiating interest package payment');
  }

  // Prepare payment data
  const paymentData = {
    userId: packageData.userId,
    packageId: null, // Will be populated after verification
    amount: packageData.principalAmount,
    email: user.email, // Include the user's email
    callbackUrl,
    metadata: {
      contributionType: 'interest_savings',
      principalAmount: packageData.principalAmount,
      interestRate: packageData.interestRate,
      lockPeriod: packageData.lockPeriod,
      name: packageData.name,
      earlyWithdrawalPenalty: packageData.earlyWithdrawalPenalty,
      isPackagePending: true, // Flag to indicate the package should be created on verification
      userId: packageData.userId, // Include userId in metadata for verification
      redirect_url:
        packageData.redirect_url ||
        `${config.paystack.frontendUrl}/payments/success?packageId=${packageData._id}&status=success`, // Store redirect URL in metadata
    },
  };

  try {
    // Initialize transaction but skip Paystack customer creation if it fails
    const skipCustomerCreation = true;
    const response = await initializeTransaction(paymentData, skipCustomerCreation);

    return response;
  } catch (error) {
    logger.error('Error initializing interest package payment:', error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to initialize interest package payment'
    );
  }
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

module.exports = {
  initializeTransaction,
  initializeDailySavingsContribution,
  initiateInterestPackagePayment,
  verifyTransaction,
  getTransactionHistory,
  createTransferRecipient,
  initiateTransfer,
  resolveBankAccount,
  getBanks,
};
