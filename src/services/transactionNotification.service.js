const logger = require('../config/logger');
const notificationService = require('./notification.service');
const userService = require('./user.service');
const accountTransactionService = require('./accountTransaction.service');

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

// Send withdrawal-approval notifications via all channels (in-app, email, SMS)
// Follows the same pattern used in withdrawal.service.js → approveWithdrawalRequest
const sendWithdrawalApprovalNotification = async ({
    userId,
    amount,
    accountNumber,
    reference,
    phoneNumber,
    availableBalance,
}) => {
    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            logger.warn(`User ${userId} not found. Skipping withdrawal approval notification.`);
            return;
        }

        await notificationService.sendMultiChannelNotification({
            userId,
            type: 'withdrawal_approval', // aligns with default preferences key
            user,
            data: {
                amount,
                accountNumber,
                phoneNumber,
            },
            notificationContent: {
                inApp: {
                    title: 'Withdrawal Request Approved',
                    body: `Your withdrawal request of ₦${amount} from account ${accountNumber} has been approved and is being processed.`,
                },
                email: {
                    subject: 'Withdrawal Request Approved',
                    template: 'WITHDRAWAL_APPROVED',
                    templateData: {
                        name: `${user.firstName} ${user.lastName}`,
                        amount,
                        accountNumber,
                        reference,
                        balance: availableBalance,
                        date: new Date(),
                    },
                },
                sms: `Your withdrawal request of ₦${amount} from account ${accountNumber} has been approved and is being processed.`,
            },
        });
    } catch (error) {
        logger.error('Error in withdrawal approval notification:', error);
    }
};

module.exports = {
    sendMultiAccountWithdrawalNotifications,
    sendWithdrawalApprovalNotification,
}; 