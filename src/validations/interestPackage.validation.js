const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInterestPackage = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    principalAmount: Joi.number().positive().required(),
    interestRate: Joi.number().positive().required(),
    lockPeriod: Joi.number().integer().positive().required(),
    compoundingFrequency: Joi.string().valid('quarterly', 'annually').default('quarterly'),
    earlyWithdrawalPenalty: Joi.number().min(0).max(100).default(50),
    paymentReference: Joi.string().optional(),
    paymentTransactionId: Joi.string().custom(objectId).optional(),
  }),
};

const getInterestPackageById = {
  params: Joi.object().keys({
    packageId: Joi.string().custom(objectId).required(),
  }),
};

const getUserInterestPackages = {
  query: Joi.object().keys({
    status: Joi.string().valid('active', 'matured', 'closed', 'pending_withdrawal'),
  }),
};

const calculateEarlyWithdrawal = {
  params: Joi.object().keys({
    packageId: Joi.string().custom(objectId).required(),
  }),
};

const requestWithdrawal = {
  params: Joi.object().keys({
    packageId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    withdrawalReason: Joi.string().min(3).max(200),
  }),
};

const getProjectedInterest = {
  params: Joi.object().keys({
    packageId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    days: Joi.number().integer().min(1).max(365),
  }),
};

module.exports = {
  createInterestPackage,
  getInterestPackageById,
  getUserInterestPackages,
  calculateEarlyWithdrawal,
  requestWithdrawal,
  getProjectedInterest,
};
