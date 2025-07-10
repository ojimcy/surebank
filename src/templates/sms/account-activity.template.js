const baseTemplate = require('./base.template');

module.exports = (data) => {
  const type = data.activityType === 'credit' ? 'Credit' : 'Debit';
  const content = `${type} Alert: ₦${data.amount.toLocaleString()} ${data.description
    }. Bal: ₦${data.balance.toLocaleString()}. Ref: ${data.reference}.`;
  return baseTemplate(content);
};
