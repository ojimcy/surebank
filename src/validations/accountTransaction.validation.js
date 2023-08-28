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

module.exports = {
  makeCustomerDeposit,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getUserByAccountNumber,
};
