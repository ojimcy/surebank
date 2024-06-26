const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSbPackage = {
  body: Joi.object().keys({
    accountNumber: Joi.number().required(),
    product: Joi.string().required().custom(objectId),
    createdBy: Joi.string().optional().custom(objectId),
    targetAmount: Joi.number().optional(),
    image: Joi.string().optional(),
    status: Joi.string().optional(),
    hasBeenCharged: Joi.boolean(),
  }),
};

const makeDailyContribution = {
  query: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    product: Joi.string().required().custom(objectId),
  }),
};

const makeSbWithdrawal = {
  query: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    product: Joi.string().required(),
  }),
};

const getPackageById = {
  params: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
};

const getUserSbPackages = {
  query: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

const mergeSavingsPackages = {
  params: Joi.object().keys({
    targetPackageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    sourcePackageIds: Joi.array().items(Joi.string()).required(),
  }),
};

const updatePackageProduct = {
  params: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    newProductId: Joi.string().required().custom(objectId),
  }),
};

const getAllSbPackages = {
  query: Joi.object().keys({
    branchId: Joi.string().optional().custom(objectId),
    accountManagerId: Joi.string().optional().custom(objectId),
  }),
};

const makeSbCustomerWithdrawal = {
  query: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    product: Joi.string().required(),
  }),
};

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
  getPackageById,
  getUserSbPackages,
  mergeSavingsPackages,
  updatePackageProduct,
  getAllSbPackages,
  makeSbCustomerWithdrawal,
};
