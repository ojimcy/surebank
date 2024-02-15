const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDailySavingsPackage = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amountPerDay: Joi.number().required(),
    target: Joi.string().required(),
    status: Joi.string().optional(),
    hasBeenCharged: Joi.boolean(),
  }),
};

const saveDailyContribution = {
  query: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    accountNumber: Joi.string().required(),
    target: Joi.string().required(),
  }),
};

const makeDailySavingsWithdrawal = {
  query: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    amount: Joi.number().required(),
    target: Joi.string().required(),
  }),
};

const getDailySavingsPackageById = {
  params: Joi.object().keys({
    packageId: Joi.string().required().custom(objectId),
  }),
};
const getUserDailySavingsPackages = {
  query: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

const getUserSavingsActivities = {
  query: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    accountNumber: Joi.string().required(),
  }),
};

const updatedPackage = {
  params: Joi.object().keys({
    packageId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    amountPerDay: Joi.number().optional(),
    target: Joi.string().optional(),
  }),
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getDailySavingsPackageById,
  getUserSavingsActivities,
  getUserDailySavingsPackages,
  updatedPackage,
};
