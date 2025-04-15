const Joi = require('joi');

/**
 * No validation needed for webhook as they come directly from Paystack
 * with specific structures that we handle in the controller
 */
const webhook = {
  body: Joi.object().required(),
};

/**
 * Validation schema for initializing a payment
 */
const initializePayment = {
  body: Joi.object().keys({
    email: Joi.string().required().email().description('Customer email'),
    amount: Joi.number().required().min(10).description('Amount in Naira'),
    callbackUrl: Joi.string().uri().description('URL to redirect after payment'),
    metadata: Joi.object().description('Additional payment metadata'),
  }),
};

/**
 * Validation schema for verifying a payment
 */
const verifyPayment = {
  params: Joi.object().keys({
    reference: Joi.string().required().description('Payment reference to verify'),
  }),
};

/**
 * Validation schema for creating a transfer recipient
 */
const createRecipient = {
  body: Joi.object().keys({
    name: Joi.string().required().description('Recipient name'),
    accountNumber: Joi.string().required().length(10).description('Bank account number'),
    bankCode: Joi.string().required().description('Bank code'),
    currency: Joi.string().default('NGN').description('Currency code'),
  }),
};

/**
 * Validation schema for initiating a transfer
 */
const initiateTransfer = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(10).description('Amount in Naira'),
    recipientCode: Joi.string().required().description('Recipient code'),
    reason: Joi.string().description('Transfer reason'),
  }),
};

/**
 * Validation schema for resolving a bank account
 */
const resolveAccount = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required().length(10).description('Bank account number'),
    bankCode: Joi.string().required().description('Bank code'),
  }),
};

module.exports = {
  webhook,
  initializePayment,
  verifyPayment,
  createRecipient,
  initiateTransfer,
  resolveAccount,
};
