module.exports = (firstName, amount, accountNumber, availableBalance, createdBy) => {
    return `Hi ${firstName}, your withdrawal of NGN${amount} from account ${accountNumber} has been approved by ${createdBy}. Your new available balance is NGN${availableBalance}. Thank you for choosing us.`;
}; 