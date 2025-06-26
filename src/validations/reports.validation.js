const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    branchId: Joi.string().optional().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    narration: Joi.string().optional(),
  }),
};

const getMyTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDateParam: Joi.number().optional(),
  }),
};

const getDailySavingsWithdrawals = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDateParam: Joi.number().optional(),
    branchId: Joi.string().optional().custom(objectId),
    userReps: Joi.string().optional().custom(objectId),
  }),
};

const getCharges = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    branchId: Joi.string().optional().custom(objectId),
    reasons: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getPackages = {
  query: Joi.object().keys({
    status: Joi.string().optional(),
    branchId: Joi.string().optional().custom(objectId),
    userReps: Joi.string().optional().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getDailyContributions = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    branchId: Joi.string().optional().custom(objectId),
    narration: Joi.string().optional(),
    createdBy: Joi.string().optional().custom(objectId),
  }),
};

const getIncomeSummary = {
  query: Joi.object().keys({
    branchId: Joi.string().optional().custom(objectId),
  }),
};

const getDashboardSummary = {
  query: Joi.object().keys({
    branchId: Joi.string().optional().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
  }),
};

module.exports = {
  getTotalContributions,
  getMyTotalContributions,
  getDailySavingsWithdrawals,
  getCharges,
  getPackages,
  getDailyContributions,
  getIncomeSummary,
  getDashboardSummary,
};
