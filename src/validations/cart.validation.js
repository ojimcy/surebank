const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
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

const increaseQuantity = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  clearCart,
  increaseQuantity,
};
