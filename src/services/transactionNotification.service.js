const logger = require('../config/logger');
const notificationService = require('./notification.service');
const userService = require('./user.service');

// Send withdrawal-approval notifications via all channels (in-app, email, SMS)
// Follows the same pattern used in withdrawal.service.js → approveWithdrawalRequest
const handleWithdrawalApprovalNotification = async ({
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
    handleWithdrawalApprovalNotification,
}; 