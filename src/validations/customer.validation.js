const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCustomer = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
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

const getCustomersByUserReps = {
  query: Joi.object().keys({
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    userReps: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCustomer,
  makeDeposit,
  makeWithdrawal,
  getCustomersByUserReps,
};
