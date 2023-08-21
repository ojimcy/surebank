const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');

const ledgerEntry = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    userId: Joi.string().required().custom(objectId),
    branchId: Joi.string().required().custom(objectId),
    narration: Joi.string().required(),
    type: Joi.string()
      .valid(...ACCOUNT_TYPE)
      .required(),
    direction: Joi.string()
      .valid(...DIRECTION_VALUE)
      .required(),
    date: Joi.number(),
  }),
};

const getLedgerEntries = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const computeDailySummary = {
  body: Joi.object().keys({
    date: Joi.number().required(),
  }),
};

const getDailySummary = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createExpenditure = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    reason: Joi.string().required(),
  }),
};

const getExpendituresByDateRange = {
  query: Joi.object().keys({
    startDate: Joi.number(),
    endDate: Joi.number(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getExpenditureById = {
  params: Joi.object().keys({
    expenditureId: Joi.string().custom(objectId),
  }),
};

const updateExpenditure = {
  params: Joi.object().keys({
    expenditureId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    reason: Joi.string().required(),
  }),
};

const deleteExpenditure = {
  params: Joi.object().keys({
    expenditureId: Joi.string().custom(objectId),
  }),
};

const getExpendituresByUserReps = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  ledgerEntry,
  getLedgerEntries,
  computeDailySummary,
  getDailySummary,
  createExpenditure,
  getExpendituresByDateRange,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getExpendituresByUserReps,
};
