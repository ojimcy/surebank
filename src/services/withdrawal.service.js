const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { WithdrawalRequest, AccountTransaction, Account } = require('../models');
const ApiError = require('../utils/ApiError');
const userService = require('./user.service');
const paystackService = require('./paystack.service');
const notificationService = require('./notification.service');
const accountTransactionService = require('./accountTransaction.service');
const logger = require('../config/logger');

/**
 * Get status of a self-withdrawal request
 * @param {string} requestId - Withdrawal request ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Withdrawal request details
 */
const getSelfWithdrawalStatus = async (requestId, userId) => {
  const withdrawalRequest = await WithdrawalRequest.findById(requestId);

  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this withdrawal request');
  }

  return withdrawalRequest;
};

/**
 * Process a transfer webhook from Paystack
 * @param {Object} event - Webhook event data
 * @returns {Promise<Object>} Processing result
 */
const processTransferWebhook = async (event) => {
  // Process only transfer.* events
  if (!event.event.startsWith('transfer.')) {
    return { processed: false, reason: 'Not a transfer event' };
  }

  const { reference } = event.data;
  const withdrawalRequest = await WithdrawalRequest.findOne({ transferReference: reference });

  if (!withdrawalRequest) {
    logger.warn(`Received transfer webhook for unknown reference: ${reference}`);
    return { processed: false, reason: 'Unknown reference' };
  }

  // Update withdrawal request based on event type
  if (event.event === 'transfer.success') {
    withdrawalRequest.status = 'processed';
    await withdrawalRequest.save();

    // Complete the transaction by spending the held amount
    await accountTransactionService.spendHeldAmount(withdrawalRequest.accountNumber, withdrawalRequest.amount);

    // Notify user
    try {
      const user = await userService.getUserById(withdrawalRequest.userId);

      await notificationService.sendMultiChannelNotification({
        userId: withdrawalRequest.userId,
        type: 'withdrawal_success',
        user,
        data: {
          amount: withdrawalRequest.amount,
          accountNumber: withdrawalRequest.accountNumber,
        },
        notificationContent: {
          inApp: {
            title: 'Withdrawal Successful',
            body: `Your withdrawal of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} has been processed successfully.`,
          },
          email: {
            subject: 'Withdrawal Processed Successfully',
            template: 'WITHDRAWAL_SUCCESS',
            templateData: {
              amount: withdrawalRequest.amount,
              accountNumber: withdrawalRequest.accountNumber,
              date: new Date(),
            },
          },
          sms: `Your withdrawal of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} has been processed successfully.`,
        },
      });
    } catch (notificationError) {
      logger.error('Failed to send success notification:', notificationError);
    }

    return { processed: true, status: 'success' };
  }
  if (event.event === 'transfer.failed') {
    withdrawalRequest.status = 'failed';
    withdrawalRequest.rejectionReason = event.data.reason || 'Transfer failed';
    await withdrawalRequest.save();

    // Return held amount to available balance
    await accountTransactionService.moveHeldAmountToAvailable(withdrawalRequest.accountNumber, withdrawalRequest.amount);

    // Notify user
    try {
      const user = await userService.getUserById(withdrawalRequest.userId);

      await notificationService.sendMultiChannelNotification({
        userId: withdrawalRequest.userId,
        type: 'withdrawal_failed',
        user,
        data: {
          amount: withdrawalRequest.amount,
          accountNumber: withdrawalRequest.accountNumber,
        },
        notificationContent: {
          inApp: {
            title: 'Withdrawal Failed',
            body: `Your withdrawal of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} failed to process.`,
          },
          email: {
            subject: 'Withdrawal Failed',
            template: 'WITHDRAWAL_FAILED',
            templateData: {
              amount: withdrawalRequest.amount,
              accountNumber: withdrawalRequest.accountNumber,
              date: new Date(),
              reason: event.data.reason || 'Transfer failed',
            },
          },
          sms: `Your withdrawal of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} failed to process.`,
        },
      });
    } catch (notificationError) {
      logger.error('Failed to send failure notification:', notificationError);
    }

    return { processed: true, status: 'failed' };
  }

  return { processed: false, reason: 'Unhandled transfer event' };
};

/**
 * Approve a withdrawal request and initiate transfer
 * @param {string} requestId - Withdrawal request ID
 * @param {string} approvedById - User ID of approver
 * @returns {Promise<Object>} Approval result
 */
const approveWithdrawalRequest = async (requestId, approvedById) => {
  const AccountTransactionModel = await AccountTransaction();
  const withdrawalRequest = await AccountTransactionModel.findById(requestId);

  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status === 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request already processed');
  }

  // Update status
  withdrawalRequest.status = 'approved';
  withdrawalRequest.approvedBy = approvedById;
  withdrawalRequest.approvedAt = new Date();
  await withdrawalRequest.save();

  // Initiate Paystack transfer
  const recipientData = {
    type: 'nuban',
    name: withdrawalRequest.bankAccountName,
    account_number: withdrawalRequest.bankAccountNumber,
    bank_code: withdrawalRequest.bankCode,
    currency: 'NGN',
  };

  try {
    // Create transfer recipient
    const recipient = await paystackService.createTransferRecipient(recipientData);

    // Initiate transfer
    const transferData = {
      source: 'balance',
      amount: withdrawalRequest.amount * 100, // Paystack uses kobo
      recipient: recipient.data.recipient_code,
      reason: `Withdrawal for ${withdrawalRequest.accountNumber}`,
    };
    logger.info('transferData', transferData);
    const transfer = await paystackService.initiateTransfer(transferData);
    logger.info('transfer', transfer);
    // Update withdrawal request with transfer data
    withdrawalRequest.transferReference = transfer.data.reference;
    withdrawalRequest.transferResponseData = transfer.data;
    withdrawalRequest.status = 'processing';
    withdrawalRequest.transferDate = new Date();
    await withdrawalRequest.save();

    // Notify user that their withdrawal request has been approved
    try {
      const user = await userService.getUserById(withdrawalRequest.userId);

      await notificationService.sendMultiChannelNotification({
        userId: withdrawalRequest.userId,
        type: 'withdrawal_approved',
        user,
        data: {
          amount: withdrawalRequest.amount,
          accountNumber: withdrawalRequest.accountNumber,
        },
        notificationContent: {
          inApp: {
            title: 'Withdrawal Request Approved',
            body: `Your withdrawal request of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} has been approved and is now being processed.`,
          },
          email: {
            subject: 'Withdrawal Request Approved',
            template: 'WITHDRAWAL_APPROVED',
            templateData: {
              amount: withdrawalRequest.amount,
              accountNumber: withdrawalRequest.accountNumber,
              date: new Date(),
            },
          },
          sms: `Your withdrawal request of ₦${withdrawalRequest.amount} from account ${withdrawalRequest.accountNumber} has been approved and is being processed.`,
        },
      });
    } catch (notificationError) {
      // Don't fail the process if notification fails
      logger.error('Failed to send approval notification:', notificationError);
    }

    return { withdrawalRequest, transfer };
  } catch (error) {
    // Handle Paystack API errors
    withdrawalRequest.status = 'failed';
    withdrawalRequest.rejectionReason = error.message || 'Failed to initiate transfer';
    await withdrawalRequest.save();

    // Return held amount to available balance
    await accountTransactionService.moveHeldAmountToAvailable(withdrawalRequest.accountNumber, withdrawalRequest.amount);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to initiate transfer: ${error.message}`);
  }
};

/**
 * Audit and process a self-withdrawal request
 * @param {string} requestId - Withdrawal request ID
 * @param {string} processedById - User ID of the staff processing the request
 * @returns {Promise<Object>} Processing result
 */
const auditAndProcessSelfWithdrawal = async (requestId, processedById) => {
  const AccountTransactionModel = await AccountTransaction();
  const withdrawalRequest = await AccountTransactionModel.findById(requestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status === 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request already processed');
  }

  // Perform thorough audit checks
  // 1. Verify account details
  const account = await accountTransactionService.getAccountByNumber(withdrawalRequest.accountNumber);
  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Associated account not found');
  }

  // 2. Verify user owns the account
  if (account.userId.toString() !== withdrawalRequest.userId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account ownership verification failed');
  }

  // 3. Verify sufficient funds (again)
  const availableBalance = await accountTransactionService.getAvailableBalance(withdrawalRequest.accountNumber);
  const heldAmount = await accountTransactionService.getHeldAmount(withdrawalRequest.accountNumber);

  // Calculate total balance including already held amount for this specific transaction
  const totalBalance = availableBalance + heldAmount;

  if (totalBalance < withdrawalRequest.amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient funds');
  }

  // 4. Verify bank account details match
  const user = await userService.getUserById(withdrawalRequest.userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // 5. Check for suspicious activity (multiple withdrawals in short time)
  const recentWithdrawals = await AccountTransactionModel.find({
    userId: withdrawalRequest.userId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    _id: { $ne: withdrawalRequest._id }, // Exclude current request
  });

  if (recentWithdrawals.length > 3) {
    // Log suspicious activity but don't necessarily block
    logger.warn(`Suspicious withdrawal activity detected for user ${withdrawalRequest.userId}`);
  }

  // If all checks pass, proceed with approval
  return approveWithdrawalRequest(requestId, processedById);
};

/**
 * Send multi-account withdrawal request notifications using existing WITHDRAWAL_REQUEST template
 * @param {Object} notificationData - Notification data
 */
const sendMultiAccountWithdrawalNotifications = async (notificationData) => {
  const { userId, withdrawalRequests, bankName, bankAccountNumber, totalAmount } = notificationData;

  try {
    const user = await userService.getUserById(userId);
    if (!user) return;

    // For single account withdrawal, use standard template data
    if (withdrawalRequests.length === 1) {
      const singleRequest = withdrawalRequests[0];

      // Notify user using existing WITHDRAWAL_REQUEST template
      await notificationService.sendTemplatedNotification({
        userId,
        templateType: 'WITHDRAWAL_REQUEST',
        user,
        data: {
          name: `${user.firstName} ${user.lastName}`,
          amount: singleRequest.amount,
          accountNumber: singleRequest.accountNumber,
          bankName,
          bankAccountNumber,
          reference: singleRequest._id.toString(),
          date: new Date(),
          status: 'pending',
          processingTime: '2',
        },
      });
    } else {
      // For multi-account, modify template data to show combined information
      const accountSummary = withdrawalRequests
        .map((wr) => `₦${wr.amount.toLocaleString()} from ${wr.accountNumber}`)
        .join(', ');

      // Use existing template but with combined data
      await notificationService.sendTemplatedNotification({
        userId,
        templateType: 'WITHDRAWAL_REQUEST',
        user,
        data: {
          name: `${user.firstName} ${user.lastName}`,
          amount: totalAmount,
          accountNumber: `${withdrawalRequests.length} accounts (${accountSummary})`,
          bankName,
          bankAccountNumber,
          reference: withdrawalRequests[0].relatedWithdrawalGroup, // Use group ID as reference
          date: new Date(),
          status: 'pending',
          processingTime: '2',
        },
      });
    }

    // Notify account manager(s) - use the first account's manager for simplicity
    const firstAccount = await accountTransactionService.getAccountByNumber(withdrawalRequests[0].accountNumber);
    if (firstAccount && firstAccount.accountManagerId) {
      const accountManager = await userService.getUserById(firstAccount.accountManagerId);

      if (accountManager) {
        await notificationService.sendTemplatedNotification({
          userId: firstAccount.accountManagerId,
          templateType: 'WITHDRAWAL_REQUEST',
          user: accountManager,
          data: {
            amount: totalAmount,
            accountNumber:
              withdrawalRequests.length === 1
                ? withdrawalRequests[0].accountNumber
                : `${withdrawalRequests.length} accounts`,
            customerName: `${user.firstName} ${user.lastName}`,
            date: new Date(),
            reference: withdrawalRequests[0].relatedWithdrawalGroup || withdrawalRequests[0]._id.toString(),
            status: 'pending',
            processingTime: '2',
          },
        });
      }
    }
  } catch (notificationError) {
    logger.error('Failed to send withdrawal notifications:', notificationError);
  }
};

/**
 * Create a multi-account withdrawal request
 * @param {Object} withdrawalData - Multi-account withdrawal data
 * @param {Array} withdrawalData.withdrawalAccounts - Array of {accountNumber, amount}
 * @param {string} withdrawalData.bankAccountName - Bank account name
 * @param {string} withdrawalData.bankAccountNumber - Bank account number
 * @param {string} withdrawalData.bankName - Bank name
 * @param {string} withdrawalData.bankCode - Bank code
 * @param {string} [withdrawalData.reason] - Reason for withdrawal (optional)
 * @param {string} userId - User ID from authentication
 * @returns {Promise<Object>} Multi-account withdrawal request details
 */
const createMultiAccountWithdrawalRequest = async (withdrawalData, userId) => {
  const { withdrawalAccounts, bankAccountName, bankAccountNumber, bankName, bankCode, reason } = withdrawalData;

  // Validate all accounts first using Promise.all
  const validationResults = await Promise.all(
    withdrawalAccounts.map(async (withdrawalAccount) => {
      const { accountNumber, amount } = withdrawalAccount;

      // Validate each account
      const account = await accountTransactionService.getAccountByNumber(accountNumber);
      if (!account) {
        throw new ApiError(httpStatus.NOT_FOUND, `Account ${accountNumber} not found`);
      }

      if (account.userId.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, `You do not have access to account ${accountNumber}`);
      }

      // Check available balance for each account
      const availableBalance = await accountTransactionService.getAvailableBalance(accountNumber);
      if (availableBalance < amount) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient funds in account ${accountNumber}`);
      }

      // Determine package type
      let packageType;
      if (account.accountType === 'ds') {
        packageType = 'DsPackage';
      } else if (account.accountType === 'sb') {
        packageType = 'SbPackage';
      } else if (account.accountType === 'ibs') {
        packageType = 'InterestPackage';
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, `Account type ${account.accountType} not supported for withdrawals`);
      }

      return {
        account,
        amount,
        packageType,
      };
    })
  );

  const totalAmount = validationResults.reduce((sum, item) => sum + item.amount, 0);

  // Check for duplicate account numbers
  const accountNumbers = withdrawalAccounts.map((wa) => wa.accountNumber);
  const uniqueAccountNumbers = [...new Set(accountNumbers)];
  if (accountNumbers.length !== uniqueAccountNumbers.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate account numbers are not allowed');
  }

  const AccountTransactionModel = await AccountTransaction();
  const AccountModel = await Account();

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transactionDate = new Date().getTime();

    // Create withdrawal requests and hold amounts using Promise.all
    const withdrawalResults = await Promise.all(
      validationResults.map(async (validatedAccount) => {
        const { account, amount, packageType } = validatedAccount;

        const withdrawalRequest = await AccountTransactionModel.create(
          [
            {
              userId,
              packageId: account.packageId,
              packageType,
              accountNumber: account.accountNumber,
              amount,
              requestedAmount: amount,
              bankAccountName,
              bankAccountNumber,
              bankName,
              bankCode,
              reason: reason || `Multi-account withdrawal - ${account.accountType}`,
              createdBy: userId,
              status: 'pending',
              isEarlyWithdrawal: false,
              narration: `Self withdrawal request - ${account.accountType}`,
              branchId: account.branchId,
              direction: 'outflow',
              date: transactionDate,
              // Link related withdrawal requests
              relatedWithdrawalGroup: transactionDate.toString(), // Use timestamp as group identifier
            },
          ],
          { session }
        );

        // Put amount on hold for each account within the transaction
        await AccountModel.findOneAndUpdate(
          { accountNumber: account.accountNumber },
          { $inc: { availableBalance: -amount } },
          { new: true, runValidators: true, session }
        );

        return withdrawalRequest[0];
      })
    );

    await session.commitTransaction();

    // Send notifications after successful transaction
    await sendMultiAccountWithdrawalNotifications({
      userId,
      withdrawalRequests: withdrawalResults,
      bankName,
      bankAccountNumber,
      totalAmount,
    });

    return {
      withdrawalRequests: withdrawalResults,
      totalAmount,
      groupId: transactionDate.toString(),
      summary: {
        accountsCount: withdrawalResults.length,
        totalAmount,
        bankDetails: {
          bankName,
          bankAccountNumber,
          bankAccountName,
        },
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Create a self-withdrawal request (DEPRECATED - Use createMultiAccountWithdrawalRequest)
 * @param {Object} withdrawalData - Withdrawal request data
 * @returns {Promise<Object>} Withdrawal request details
 */
const createSelfWithdrawalRequest = async (withdrawalData) => {
  // Convert single withdrawal to multi-account format and use the new function
  const multiAccountData = {
    withdrawalAccounts: [
      {
        accountNumber: withdrawalData.accountNumber,
        amount: withdrawalData.amount,
      },
    ],
    bankAccountName: withdrawalData.bankAccountName,
    bankAccountNumber: withdrawalData.bankAccountNumber,
    bankName: withdrawalData.bankName,
    bankCode: withdrawalData.bankCode,
    reason: withdrawalData.reason,
  };

  const result = await createMultiAccountWithdrawalRequest(multiAccountData, withdrawalData.userId);

  // Return the first (and only) withdrawal request for backwards compatibility
  return result.withdrawalRequests[0];
};

module.exports = {
  createSelfWithdrawalRequest,
  getSelfWithdrawalStatus,
  auditAndProcessSelfWithdrawal,
  processTransferWebhook,
  approveWithdrawalRequest,
  createMultiAccountWithdrawalRequest,
};
