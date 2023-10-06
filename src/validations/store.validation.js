const Joi = require('joi');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().required(),
    slug: Joi.string().required(),
  }),
};

module.exports = {
  createCategory,
};
