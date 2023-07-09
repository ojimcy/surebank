const Joi = require('joi');

const createProductRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    longDescription: Joi.string().required(),
    image: Joi.string().required(),
    permalink: Joi.string().required(),
  }),
};

module.exports = {
  createProductRequest,
};
