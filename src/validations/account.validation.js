const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');

const createAccount = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    accountType: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
    createdBy: Joi.string().custom(objectId),
    accountManagerName: Joi.string(),
  }),
};

const assignBranch = {
  params: Joi.object().keys({
    accountId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
};

const assignManager = {
  params: Joi.object().keys({
    accountId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    managerId: Joi.string().required().custom(objectId),
  }),
};

const ledgerEntry = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    userId: Joi.string().required().custom(objectId),
    branchId: Joi.string().required().custom(objectId),
    narration: Joi.string().required(),
    type: Joi.string()
      .valid(...ACCOUNT_TYPE)
      .required(),
    direction: Joi.string()
      .valid(...DIRECTION_VALUE)
      .required(),
    date: Joi.number(),
  }),
};

const getLedgerEntries = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const computeDailySummary = {
  body: Joi.object().keys({
    date: Joi.number().required(),
  }),
};

const makeCustomerDeposit = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    userReps: Joi.string().required(),
    narration: Joi.string().required(),
  }),
};

const getUserAccount = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

const getAllAccounts = {
  query: Joi.object().keys({
    accountNumber: Joi.number(),
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getAccountManager = {
  query: Joi.object().keys({
    accountNumber: Joi.string(),
  }),
};

const updateAccount = {
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    accountType: Joi.string().optional(),
    branchId: Joi.string().optional().custom(objectId),
    accountManagerId: Joi.string().optional(),
  }),
};

const getAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
  ledgerEntry,
  getLedgerEntries,
  computeDailySummary,
  makeCustomerDeposit,
  getUserAccount,
  getAllAccounts,
  deleteAccount,
  getAccountManager,
  updateAccount,
  getAccount,
};
