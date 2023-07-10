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

const createProductCatalogue = {
  query: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    merchantId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    image: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    costPrice: Joi.string().required(),
    originalPrice: Joi.string().required(),
    price: Joi.string().required(),
    quantity: Joi.string().required(),
    text: Joi.string().required(),
  }),
};

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
  createProductCatalogue,
};
