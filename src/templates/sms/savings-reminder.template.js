const baseTemplate = require('./base.template');

module.exports = (data) => {
  const content = `Savings Reminder: ${data.planName}. Next payment due ${new Date(
    data.nextDueDate
  ).toLocaleDateString()}. Target: ₦${data.targetAmount.toLocaleString()}, Current: ₦${data.currentBalance.toLocaleString()}.`;
  return baseTemplate(content);
};
