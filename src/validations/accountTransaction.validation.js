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
  query: Joi.object().keys({
    requestId: Joi.string().required(),
  }),
};

const getAccountTransactions = {
  query: Joi.object().keys({
    accountNumber: Joi.string().optional(),
    narration: Joi.string().optional(),
    createdBy: Joi.string().optional().custom(objectId),
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    userId: Joi.string().optional().custom(objectId),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAccountByNumber = {
  query: Joi.object().keys({
    accountNumber: Joi.string().required(),
  }),
};

const getCustomerwithdrawals = {
  query: Joi.object().keys({
    createdBy: Joi.string().optional().custom(objectId),
    approvedBy: Joi.string().optional().custom(objectId),
    branchId: Joi.string().optional().custom(objectId),
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    accountNumber: Joi.number().optional(),
    narration: Joi.string().optional(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const makeWithdrawalRequest = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    accountName: Joi.string().optional(),
    bankAccountNumber: Joi.number().optional(),
    bankName: Joi.string().optional(),
  }),
};

const rejectWithdrawalRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    narration: Joi.string().required(),
  }),
};

const getAllWithdrawalRequests = {
  query: Joi.object().keys({
    createdBy: Joi.string().optional().custom(objectId),
    branchId: Joi.string().optional().custom(objectId),
    status: Joi.string().optional(),
    narration: Joi.string().optional(),
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getWithdrawalRequestById = {
  params: Joi.object().keys({
    requestId: Joi.string().required(),
  }),
};

module.exports = {
  makeCustomerDeposit,
  getAvailableBalance,
  getAccountBalance,
  makeCustomerWithdrawal,
  getAccountTransactions,
  getAccountByNumber,
  getCustomerwithdrawals,
  makeWithdrawalRequest,
  rejectWithdrawalRequest,
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
};
