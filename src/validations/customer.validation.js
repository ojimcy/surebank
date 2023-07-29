const Joi = require('joi');
const { password } = require('./custom.validation');

const createCustomer = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    branchName: Joi.string().required(),
    accountType: Joi.string().optional(),
  }),
};

const makeDeposit = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    narration: Joi.string().required(),
  }),
};

const makeWithdrawal = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    narration: Joi.string().required(),
  }),
};

module.exports = {
  createCustomer,
  makeDeposit,
  makeWithdrawal,
};
