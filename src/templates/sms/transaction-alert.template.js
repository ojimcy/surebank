const baseTemplate = require('./base.template');

module.exports = (data) => {
  const status = data.status === 'successful' ? 'Successful' : 'Failed';
  const content = `Transaction ${status}: ₦${data.amount.toLocaleString()} ${data.transactionType}. Ref: ${
    data.reference
  }. Bal: ₦${data.balance.toLocaleString()}.`;
  return baseTemplate(content);
};
