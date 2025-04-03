const Joi = require('joi');

const initializeDailySavingsPayment = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required().min(100), // Minimum amount in kobo
    target: Joi.string().required(),
  }),
};

const handlePaystackWebhook = {
  body: Joi.object().keys({
    event: Joi.string().required(),
    data: Joi.object()
      .keys({
        reference: Joi.string().required(),
        metadata: Joi.object(),
        gateway_response: Joi.string(),
        reason: Joi.string(),
      })
      .required(),
  }),
};

module.exports = {
  initializeDailySavingsPayment,
  handlePaystackWebhook,
};
