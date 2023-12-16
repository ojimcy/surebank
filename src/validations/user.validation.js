const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().optional().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().optional(),
    phoneNumber: Joi.string().required(),
    branchId: Joi.string().optional().custom(objectId),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().optional().email(),
      password: Joi.string().optional().custom(password),
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      address: Joi.string().optional(),
      branchId: Joi.string(),
      role: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getMyProfile = {
  query: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    email: Joi.string().optional().email(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    address: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateProfile,
};
