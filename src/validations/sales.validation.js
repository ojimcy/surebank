const Joi = require('joi');
const { objectId } = require('./custom.validation');

const commitSale = {
  query: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
    salesRepId: Joi.string().required().custom(objectId),
    paymentMethod: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
  }),
};

const viewSales = {
  query: Joi.object().keys({
    status: Joi.string(),
    paymentMethod: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const cancelSale = {
  params: Joi.object().keys({
    salesId: Joi.string().required().custom(objectId),
  }),
};

const updatePayment = {
  params: Joi.object().keys({
    salesId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  commitSale,
  viewSales,
  cancelSale,
  updatePayment,
};
