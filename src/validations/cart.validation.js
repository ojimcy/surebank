const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
    quantity: Joi.number().required(),
    packageId: Joi.string().optional().custom(objectId),
  }),
};

const getCartItems = {
  body: Joi.object().keys({
    userId: Joi.custom(objectId).optional(),
  }),
};

const removeCartItem = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
  }),
};

const clearCart = {
  body: Joi.object().keys({
    userId: Joi.custom(objectId).optional(),
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
