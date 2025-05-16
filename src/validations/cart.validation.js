const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    productCatalogueId: Joi.string().required().custom(objectId),
    quantity: Joi.number().integer().min(1).required().messages({
      'number.min': 'Quantity must be at least 1',
      'number.integer': 'Quantity must be a whole number',
    }),
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
