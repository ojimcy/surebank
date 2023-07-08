const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMerchantRequest = {
  body: Joi.object().keys({
    storeName: Joi.string().required(),
    storeAddress: Joi.string().required(),
    storePhoneNumber: Joi.string().required(),
    email: Joi.string().required().email(),
    website: Joi.string().optional(),
  }),
};

const viewRequests = {
  query: Joi.object().keys({
    status: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const manageRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
};

const approveRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
};

const cancelledRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reasons: Joi.array().required(),
  }),
};

const denyRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reasons: Joi.array().required(),
  }),
};

const getMerchants = {
  query: Joi.object().keys({
    storeName: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const addMerchantAdmin = {
  query: Joi.object().keys({
    merchantId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    role: Joi.string().required(),
    userId: Joi.string().custom(objectId).required(),
  }),
};

const removeMerchantAdmin = {
  params: Joi.object().keys({
    merchantId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    adminId: Joi.string().custom(objectId).required(),
  }),
};

const listMerchantAdmins = {
  params: Joi.object().keys({
    merchantId: Joi.string().custom(objectId),
  }),
};

const getMerchant = {
  params: Joi.object().keys({
    merchantId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMerchantRequest,
  viewRequests,
  manageRequest,
  cancelledRequest,
  denyRequest,
  getMerchants,
  getMerchant,
  approveRequest,
  addMerchantAdmin,
  removeMerchantAdmin,
  listMerchantAdmins,
};
