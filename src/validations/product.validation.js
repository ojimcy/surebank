const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProductRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    longDescription: Joi.string().required(),
    image: Joi.string().required(),
    barcode: Joi.string().optional(),
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
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    merchantId: Joi.string().required().custom(objectId),
    image: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    costPrice: Joi.number().required(),
    originalPrice: Joi.number().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    text: Joi.string().required(),
  }),
};

const approveProductRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
};

const rejectProduct = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reviewComment: Joi.string().required(),
  }),
};

const viewProduct = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    image: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    longDescription: Joi.string().optional(),
    barcode: Joi.string().optional(),
    categoryId: Joi.string().optional().custom(objectId),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
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
  createProductCatalogue,
  approveProductRequest,
  rejectProduct,
  viewProduct,
  deleteProduct,
  updateProduct,
};
