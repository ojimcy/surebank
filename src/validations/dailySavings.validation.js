const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDailySavingsPackage = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amountPerDay: Joi.number().required(),
    status: Joi.string().optional(),
    hasBeenCharged: Joi.boolean(),
  }),
};

const saveDailyContribution = {
  query: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.string().required(),
  }),
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
};
