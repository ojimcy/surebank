const Joi = require('joi');
const { objectId } = require('./custom.validation');

const recordCharge = {
  body: Joi.object().keys({
    packageId: Joi.string().optional().custom(objectId),
    userId: Joi.string().optional().custom(objectId),
    amount: Joi.number().required(),
    reasons: Joi.string().required(),
  }),
};

module.exports = {
  recordCharge,
};
