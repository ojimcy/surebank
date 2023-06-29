const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBranch = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().required().email(),
    manager: Joi.string().required(),
  }),
};

const getBranches = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBranch = {
  params: Joi.object().keys({
    branchId: Joi.string().custom(objectId),
  }),
};

const updateBranchManager = {
  params: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    manager: Joi.string().required(),
  }),
};

module.exports = {
  createBranch,
  getBranches,
  getBranch,
  updateBranchManager,
};
