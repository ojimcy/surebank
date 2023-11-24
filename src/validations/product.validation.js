const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProductRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    barcode: Joi.string().optional(),
    categoryId: Joi.string().required().custom(objectId),
    subCategoryId: Joi.string().optional().custom(objectId),
    brand: Joi.string().required().custom(objectId),
    features: Joi.string().optional(),
    variations: Joi.string().optional(),
    shipping: Joi.string().optional(),
    inventory: Joi.string().optional(),
    tags: Joi.string().optional(),
    slug: Joi.string().optional(),
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
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    longDescription: Joi.string().optional(),
    image: Joi.string().optional(),
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
    featuredImage: Joi.string().required(),
    images: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    salesPrice: Joi.number().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    discount: Joi.number().optional(),
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
    reasonForRejection: Joi.string().required(),
  }),
};

const viewProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const viewProduct = {
  params: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    images: Joi.string().optional(),
    barcode: Joi.string().optional(),
    categoryId: Joi.string().optional().custom(objectId),
    subCategoryId: Joi.string().optional().custom(objectId),
    brand: Joi.string().optional().custom(objectId),
    originalPrice: Joi.number().optional(),
    price: Joi.number().optional(),
    reviews: Joi.string().optional(),
    features: Joi.string().optional(),
    ratings: Joi.string().optional(),
    variations: Joi.string().optional(),
    shipping: Joi.string().optional(),
    stock: Joi.string().optional(),
    discount: Joi.number().optional(),
    tags: Joi.string().optional(),
    slug: Joi.string().optional(),
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

const addProductToCollection = {
  query: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    collectionId: Joi.string().required().custom(objectId),
  }),
};

const getProductsBySlug = {
  query: Joi.object().keys({
    collectionSlug: Joi.string().required(),
  }),
};

const deleteProductCatalogue = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const getProductsByIds = {
  query: Joi.object().keys({
    ids: Joi.array().items(Joi.string().custom(objectId)).single(),
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
  viewProducts,
  viewProduct,
  deleteProduct,
  updateProduct,
  addProductToCollection,
  getProductsBySlug,
  deleteProductCatalogue,
  getProductsByIds,
};
