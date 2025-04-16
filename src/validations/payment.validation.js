const Joi = require('joi');
const { objectId } = require('./custom.validation');

const initializeDsContribution = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(), // Should likely come from auth, but validating if passed
    packageId: Joi.string().custom(objectId).required(),
    amount: Joi.number().positive().required(),
    callbackUrl: Joi.string().uri().optional(), // Optional callback URL
  }),
};

const verifyPayment = {
  query: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

module.exports = {
  initializeDsContribution,
  verifyPayment,
};
