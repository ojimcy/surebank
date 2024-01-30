const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    deliveryAddress: Joi.object().keys({
      fullName: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      branchId: Joi.string().optional().custom(objectId),
      location: Joi.object().keys({
        lat: Joi.string(),
        lng: Joi.string(),
        address: Joi.string(),
        name: Joi.string(),
        vicinity: Joi.string(),
        googleAddressId: Joi.string(),
      }),
    }),
    paymentMethod: Joi.string().required(),
    paymentResult: Joi.object().keys({
      id: Joi.string(),
      status: Joi.string(),
      email_address: Joi.string(),
    }),
    deliveryPrice: Joi.number().optional(),
    isPaid: Joi.boolean().optional(),
    isDelivered: Joi.boolean().optional(),
    paidAt: Joi.date().optional(),
    deliveredAt: Joi.date().optional(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const payOrderWithSbBalance = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    packageId: Joi.string().required(),
  }),
};

const getAllOrders = {
  query: Joi.object().keys({
    createdBy: Joi.string().optional().custom(objectId),
    branchId: Joi.string().optional().custom(objectId),
    status: Joi.string().optional(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createOrder,
  getOrder,
  payOrderWithSbBalance,
  getAllOrders,
};
