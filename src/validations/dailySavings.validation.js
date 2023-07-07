const Joi = require('joi');

const createDailySavingsPackage = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amountPerDay: Joi.number().required(),
    status: Joi.string().optional(),
    hasBeenCharged: Joi.boolean(),
  }),
};

module.exports = {
  createDailySavingsPackage,
};
