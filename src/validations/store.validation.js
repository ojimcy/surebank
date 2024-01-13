const Joi = require('joi');

const createCategory = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    image: Joi.string().optional(),
    description: Joi.string().optional(),
    parentCategoryId: Joi.optional(),
  }),
};

const createBrand = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    logo: Joi.string().optional(),
  }),
};

module.exports = {
  createCategory,
  createBrand,
};
