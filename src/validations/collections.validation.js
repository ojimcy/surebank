const Joi = require('joi');

const createCollection = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().optional(),
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
