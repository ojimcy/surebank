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

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
};
