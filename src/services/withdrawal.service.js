const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { WithdrawalRequest } = require('../models');
const ApiError = require('../utils/ApiError');
const userService = require('./user.service');
const paystackService = require('./paystack.service');
const notificationService = require('./notification.service');
const accountTransactionService = require('./accountTransaction.service');
const logger = require('../config/logger');

/**
 * Create a self-withdrawal request
 * @param {Object} withdrawalData - Withdrawal request data
 * @param {string} withdrawalData.userId - User ID
 * @param {string} withdrawalData.accountNumber - Account number
 * @param {number} withdrawalData.amount - Amount to withdraw
 * @param {string} withdrawalData.bankAccountName - Bank account name
 * @param {string} withdrawalData.bankAccountNumber - Bank account number
 * @param {string} withdrawalData.bankName - Bank name
 * @param {string} withdrawalData.bankCode - Bank code
 * @param {string} [withdrawalData.reason] - Reason for withdrawal (optional)
 * @returns {Promise<Object>} Withdrawal request details
 */
const createSelfWithdrawalRequest = async (withdrawalData) => {
  const { userId, accountNumber, amount, bankAccountName, bankAccountNumber, bankName, bankCode, reason } = withdrawalData;

  // Validate account ownership and balance
  const account = await accountTransactionService.getAccountByNumber(accountNumber);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  if (account.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this account');
  }

  // Check available balance
  const availableBalance = await accountTransactionService.getAvailableBalance(accountNumber);
  if (availableBalance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient funds');
  }

  // Determine package type based on account type
  let packageType;
  if (account.accountType === 'ds') {
    packageType = 'DsPackage';
  } else if (account.accountType === 'sb') {
    packageType = 'SbPackage';
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account type not supported for withdrawals');
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequest.create(
      [
        {
          userId,
          packageId: account.packageId,
          packageType,
          accountNumber,
          amount,
          requestedAmount: amount,
          bankAccountName,
          bankAccountNumber,
          bankName,
          bankCode,
          reason,
          requestedBy: userId,
          status: 'pending',
          isEarlyWithdrawal: false,
          narration: 'Self withdrawal request',
        },
      ],
      { session }
    );

    // Put amount on hold
    await accountTransactionService.putAmountOnHold(accountNumber, amount);

    // Notify account manager
    try {
      const user = await userService.getUserById(userId);
      const accountManager = await userService.getUserById(account.accountManagerId);

      if (accountManager) {
        await notificationService.sendMultiChannelNotification({
          userId: account.accountManagerId,
          type: 'withdrawal_request',
          user: accountManager,
          data: {
            amount,
            accountNumber,
            customerName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
          },
          notificationContent: {
            inApp: {
              title: 'New Withdrawal Request',
              body: `Customer ${
                user ? `${user.firstName} ${user.lastName}` : accountNumber
              } has requested a withdrawal of ₦${amount} from account ${accountNumber}`,
            },
            email: {
              subject: 'New Withdrawal Request',
              template: 'WITHDRAWAL_REQUEST',
              templateData: {
                customerName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
                amount,
                accountNumber,
                date: new Date(),
              },
            },
          },
        });
      }

      // Notify the user about their withdrawal request
      if (user) {
        await notificationService.sendMultiChannelNotification({
          userId,
          type: 'withdrawal_alert',
          user,
          data: {
            amount,
            accountNumber,
            bankName,
            bankAccountNumber,
            reference: withdrawalRequest[0]._id.toString(),
          },
          notificationContent: {
            inApp: {
              title: 'Withdrawal Request Received',
              body: `Your withdrawal request of ₦${amount} from account ${accountNumber} has been received. It will be processed within 2 working days.`,
            },
            email: {
              subject: 'Withdrawal Request Received',
              template: 'withdrawal-alert',
              templateData: {
                name: `${user.firstName} ${user.lastName}`,
                amount,
                accountNumber,
                bankName,
                bankAccountNumber,
                reference: withdrawalRequest[0]._id.toString(),
                date: new Date(),
                status: 'pending',
                processingTime: 'maximum 2 working days',
              },
            },
            sms: `Your withdrawal request of ₦${amount} from account ${accountNumber} has been received. It will be processed within 2 working days.`,
          },
        });
      }
    } catch (notificationError) {
      // Don't fail the transaction if notification fails
      logger.error('Failed to send notifications:', notificationError);
    }

    await session.commitTransaction();

    return withdrawalRequest[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

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
  const withdrawalRequest = await WithdrawalRequest.findById(requestId);

  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request already processed');
  }

  // Update status
  withdrawalRequest.status = 'approved';
  withdrawalRequest.approvedBy = approvedById;
  withdrawalRequest.approvedAt = new Date();
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

    const transfer = await paystackService.initiateTransfer(transferData);

    // Update withdrawal request with transfer data
    withdrawalRequest.transferReference = transfer.data.reference;
    withdrawalRequest.transferResponseData = transfer.data;
    withdrawalRequest.status = 'processing';
    withdrawalRequest.transferDate = new Date();
    await withdrawalRequest.save();

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

module.exports = {
  createSelfWithdrawalRequest,
  getSelfWithdrawalStatus,
  processTransferWebhook,
  approveWithdrawalRequest,
};
