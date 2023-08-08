const Joi = require('joi');

const getTotalContributions = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDateParam: Joi.number(),
  }),
};

module.exports = { getTotalContributions };
