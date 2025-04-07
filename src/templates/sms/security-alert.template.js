const baseTemplate = require('./base.template');

module.exports = (data) => {
  const content = `Security Alert: ${data.message}. If not you, call ${data.supportNumber} immediately.`;
  return baseTemplate(content);
};
