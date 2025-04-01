const Joi = require('joi');

const createIbSavingsPackage = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    savingsType: Joi.string().valid('fixed', 'flexible').required(),
    duration: Joi.when('savingsType', {
      is: 'fixed',
      then: Joi.number().required().min(3).max(36),
      otherwise: Joi.number().optional().min(0.25).max(36),
    }),
    initialDeposit: Joi.when('savingsType', {
      is: 'fixed',
      then: Joi.number().required().min(1000),
      otherwise: Joi.number().optional().min(1000),
    }),
  }),
};

module.exports = {
  createIbSavingsPackage,
};
