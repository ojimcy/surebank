const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
    unitPrice: Joi.number().required(),
    quantity: Joi.number().required(),
  }),
};

const getCartItems = {
  body: Joi.object().keys({
    userId: Joi.optional().custom(objectId),
  }),
};

const removeCartItem = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
  }),
};

const clearCart = {
  body: Joi.object().keys({
    userId: Joi.optional().custom(objectId),
  }),
};

const commitSale = {
  body: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
    salesRepId: Joi.string().required().custom(objectId),
    paymentMethod: Joi.string().required(),
    paymentStatus: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
  commitSale,
};
