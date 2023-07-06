const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCustomer = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    branchId: Joi.string().custom(objectId).optional(),
    accountType: Joi.string().optional(),
  }),
};

module.exports = {
  createCustomer,
};
