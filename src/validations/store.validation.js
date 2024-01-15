const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    image: Joi.string().optional(),
    description: Joi.string().optional(),
    slug: Joi.string().optional(),
    parentCategoryId: Joi.optional(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().optional(),
    image: Joi.string().optional(),
    description: Joi.string().optional(),
    slug: Joi.string().optional(),
    parentCategoryId: Joi.optional(),
  }),
};

const deleteCatgory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
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
  updateCategory,
  deleteCatgory,
};
