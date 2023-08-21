const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDateParam: Joi.number(),
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

module.exports = { getTotalContributions, getTotalContributionsByUserReps, getMyTotalContributions };
