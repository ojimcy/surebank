const Joi = require('joi');

const makeCustomerDeposit = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    operatorId: Joi.string().required(),
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
    operatorId: Joi.string().required(),
    narration: Joi.string().required(),
  }),
};

module.exports = {
  makeCustomerDeposit,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
};
