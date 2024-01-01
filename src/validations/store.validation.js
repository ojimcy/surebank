const Joi = require('joi');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().optional(),
    description: Joi.string().optional(),
    slug: Joi.string().optional(),
    subCategories: Joi.array().optional(),
  }),
};

module.exports = {
  createCategory,
};
