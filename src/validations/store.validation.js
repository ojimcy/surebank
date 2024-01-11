const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    image: Joi.string().optional(),
    description: Joi.string().optional(),
    slug: Joi.string().optional(),
    parentCategoryId: Joi.string().optional().custom(objectId),
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
