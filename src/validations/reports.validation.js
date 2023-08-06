const Joi = require('joi');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDate: Joi.number(),
  }),
};

module.exports = { getTotalContributions };
