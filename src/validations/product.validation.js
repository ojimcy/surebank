const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProductRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    longDescription: Joi.string().required(),
    image: Joi.string().required(),
    barcode: Joi.string().required(),
    categoryId: Joi.string().required().custom(objectId),
  }),
};

const viewProductRequests = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateProductRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    longDescription: Joi.string().required(),
    image: Joi.string().required(),
  }),
};

const deleteProductRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
};
