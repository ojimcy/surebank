const logger = require('../config/logger');
const { sendMultiChannelNotification } = require('./notification.service');
const { withdrawalApprovalMessage } = require('../templates/sms/templates');
const { withdrawalApprovalTemplate } = require('../templates/emails/withdrawal-approval.template');

const handleWithdrawalApprovalNotification = async ({ user, data }) => {
    const { amount, accountNumber, availableBalance, createdBy, reference } = data;

    try {
        const notificationContent = {
            inApp: {
                title: 'Withdrawal Approved',
                body: `Your withdrawal of ${amount} has been approved.`,
            },
            email: {
                subject: 'Withdrawal Approval Confirmation',
                template: withdrawalApprovalTemplate,
                templateData: {
                    name: user.firstName,
                    amount,
                    transactionDate: new Date().toLocaleDateString(),
                    transactionType: 'Withdrawal',
                    reference,
                    balance: availableBalance,
                    description: `Withdrawal of ${amount} approved by ${createdBy}.`,
                },
            },
            sms: withdrawalApprovalMessage(user.firstName, amount, accountNumber, availableBalance, createdBy),
        };

        await sendMultiChannelNotification({
            userId: user._id,
            type: 'account_activity',
            user,
            data,
            notificationContent,
        });
    } catch (error) {
        logger.error('Error in withdrawal approval notification:', error);
    }
};

module.exports = {
    handleWithdrawalApprovalNotification,
}; 