const Joi = require('joi');
const { objectId } = require('./custom.validation');

const sendBulkSms = {
  query: Joi.object().keys({
    branchId: Joi.string().optional().custom(objectId),
    accountType: Joi.string().optional(),
  }),
  body: Joi.object().keys({
    message: Joi.string().optional(),
  }),
};

module.exports = {
  sendBulkSms,
};
