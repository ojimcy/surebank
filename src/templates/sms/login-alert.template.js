const baseTemplate = require('./base.template');

module.exports = (data) => {
  const suspicious = data.suspicious ? 'Suspicious ' : '';
  const content = `${suspicious}Login Alert: ${data.device} from ${data.location}. If not you, call ${data.supportNumber} immediately.`;
  return baseTemplate(content);
};
