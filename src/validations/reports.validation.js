const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number().optional(),
    endDate: Joi.number().optional(),
    branchId: Joi.string().optional().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    narration: Joi.string(),
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
    startDate: Joi.number(),
    endDate: Joi.number(),
    branchId: Joi.string().optional().custom(objectId),
    reasons: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPackages = {
  query: Joi.object().keys({
    status: Joi.string(),
    branchId: Joi.string().optional().custom(objectId),
    userReps: Joi.string().optional().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDailyContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDate: Joi.number(),
    branchId: Joi.string().optional().custom(objectId),
    narration: Joi.string(),
    createdBy: Joi.string(),
  }),
};

module.exports = {
  getTotalContributions,
  getDailySavingsWithdrawals,
  getCharges,
  getPackages,
  getDailyContributions,
};
