const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAccount = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    accountType: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
  }),
};

const assignBranch = {
  params: Joi.object().keys({
    accountId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    branchId: Joi.string().required().custom(objectId),
  }),
};

const assignManager = {
  params: Joi.object().keys({
    accountId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    managerId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createAccount,
  assignBranch,
  assignManager,
};
