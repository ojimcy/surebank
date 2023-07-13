const Joi = require('joi');
const { objectId } = require('./custom.validation');

const commitSale = {
  body: Joi.object().keys({
    merchantId: Joi.string().required().custom(objectId),
    salesRepId: Joi.string().required().custom(objectId),
    paymentMethod: Joi.string().required(),
    branchId: Joi.string().required().custom(objectId),
  }),
};

const viewSales = {
  params: Joi.object().keys({
    salesRepId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string(),
    paymentMethod: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    role: Joi.string(),
  }),
};

module.exports = {
  commitSale,
  viewSales,
};
