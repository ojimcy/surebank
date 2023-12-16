const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDateParam: Joi.number(),
    branchId: Joi.string().optional().custom(objectId),
  }),
};

const getTotalContributionsByUserReps = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDateParam: Joi.number(),
  }),
  params: Joi.object().keys({
    userReps: Joi.string().required().custom(objectId),
  }),
};

const getMyTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDateParam: Joi.number(),
  }),
};

const getCharges = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDate: Joi.number(),
    branchId: Joi.string().optional().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPackages = {
  query: Joi.object().keys({
    status: Joi.string(),
    branchId: Joi.string().optional().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getTotalContributions,
  getTotalContributionsByUserReps,
  getMyTotalContributions,
  getCharges,
  getPackages,
};
