const Joi = require('joi');

const getStats = {
  query: Joi.object().keys({
    period: Joi.string().valid('1d', '7d', '30d', '90d').default('7d'),
  }),
};

const getSuppressionList = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    reason: Joi.string().valid('bounce', 'complaint', 'manual', 'unsubscribe', 'spam'),
    provider: Joi.string().valid('ses', 'mailjet').default('mailjet'),
    search: Joi.string().min(1).max(100),
  }),
};

const removeFromSuppressionList = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  query: Joi.object().keys({
    reason: Joi.string().valid('bounce', 'complaint', 'manual', 'unsubscribe', 'spam'),
  }),
};

module.exports = {
  getStats,
  getSuppressionList,
  removeFromSuppressionList,
};