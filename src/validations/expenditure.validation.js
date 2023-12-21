const Joi = require('joi');
const { objectId } = require('./custom.validation');

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
    createdBy: Joi.string().custom(objectId),
    branchId: Joi.string().custom(objectId),
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

const approveExpenditure = {
  params: Joi.object().keys({
    expenditureId: Joi.string().custom(objectId),
  }),
};
const rejectExpenditure = {
  params: Joi.object().keys({
    expenditureId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reasonForRejection: Joi.string().required(),
  }),
};

module.exports = {
  createExpenditure,
  getExpendituresByDateRange,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getExpendituresByUserReps,
  approveExpenditure,
  rejectExpenditure,
};
