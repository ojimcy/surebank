const baseTemplate = require('./base.template');

module.exports = (data) => {
  const content = `KYC Update: ${data.status}. ${data.message}. ${data.nextSteps ? data.nextSteps[0] : ''}`;
  return baseTemplate(content);
};
