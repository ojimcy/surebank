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

const selfWithdrawalRequest = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    bankName: Joi.string().required(),
    bankCode: Joi.string().required(),
    bankAccountNumber: Joi.string().required(),
    bankAccountName: Joi.string().required(),
    reason: Joi.string().optional(),
  }),
};

const getSelfWithdrawalStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const paystackWebhook = {
  body: Joi.object()
    .keys({
      event: Joi.string().required(),
      data: Joi.object().required(),
    })
    .unknown(true),
};

const processSelfWithdrawal = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  initializeDsContribution,
  verifyPayment,
  selfWithdrawalRequest,
  getSelfWithdrawalStatus,
  paystackWebhook,
  processSelfWithdrawal,
};
