const Joi = require('joi');
const { objectId } = require('./custom.validation');

const storeCard = {
  body: Joi.object().keys({
    paystackReference: Joi.string().required(),
    setAsDefault: Joi.boolean().default(false),
  }),
};

const getUserCards = {
  query: Joi.object().keys({
    activeOnly: Joi.boolean().default(true),
  }),
};

const getCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
  }),
};

const setDefaultCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
  }),
};

const deactivateCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
  }),
};

const deleteCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
  }),
};

const validateCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  storeCard,
  getUserCards,
  getCard,
  setDefaultCard,
  deactivateCard,
  deleteCard,
  validateCard,
}; 