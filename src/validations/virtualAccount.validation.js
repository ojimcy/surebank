const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createVirtualAccount = {
  // No body needed, uses authenticated user's ID
};

const getUserVirtualAccount = {
  // No body needed, uses authenticated user's ID
};

const createUserVirtualAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const deactivateVirtualAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createVirtualAccount,
  getUserVirtualAccount,
  createUserVirtualAccount,
  deactivateVirtualAccount,
};
