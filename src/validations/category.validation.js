const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getCategories = {
  query: Joi.object().keys({
    title: Joi.string(),
    slug: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getCategories,
  getCategory,
};