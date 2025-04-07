const baseTemplate = require('./base.template');

module.exports = (data) => {
  const content = `Password Reset: Use code ${data.otp} to reset your password. Expires in ${data.expiryTime} minutes. If not requested, call ${data.supportNumber}.`;
  return baseTemplate(content);
};
