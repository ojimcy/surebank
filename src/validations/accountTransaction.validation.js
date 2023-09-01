const Joi = require('joi');
const { objectId } = require('./custom.validation');

const makeCustomerDeposit = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    narration: Joi.string().required(),
  }),
};

const getAvailableBalance = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
  }),
};

const getAccountBalance = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
  }),
};

const makeCustomerWithdrawal = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    narration: Joi.string().required(),
  }),
};

const getAccountTransactions = {
  query: Joi.object().keys({
    accountNumber: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserByAccountNumber = {
  query: Joi.object().keys({
    accountNumber: Joi.string().required(),
  }),
};

const getCustomerwithdrawals = {
  query: Joi.object().keys({
    userReps: Joi.string().optional().custom(objectId),
    branchId: Joi.string().optional().custom(objectId),
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    accountNumber: Joi.number().optional(),
  }),
};

module.exports = {
  makeCustomerDeposit,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getUserByAccountNumber,
  getCustomerwithdrawals,
};
