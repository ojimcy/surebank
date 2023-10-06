const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProductRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    slug: Joi.string().required(),
    parentCategory: Joi.string().optional().custom(objectId),
  }),
};

module.exports = {
  createProductRequest,
};
