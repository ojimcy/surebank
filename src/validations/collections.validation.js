const Joi = require('joi');

const createCollection = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    slug: Joi.string().required(),
  }),
};

const updateCollection = {
  body: Joi.object().keys({
    title: Joi.string().optional(),
    name: Joi.string().optional(),
    slug: Joi.string().optional(),
  }),
};

module.exports = {
  createCollection,
  updateCollection,
};
