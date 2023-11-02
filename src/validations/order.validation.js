const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    user: Joi.string().required(),
    orderItems: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string(),
          quantity: Joi.number(),
          image: Joi.string(),
          featuredImage: Joi.string(),
          price: Joi.number(),
        })
      )
      .required(),
    shippingAddress: Joi.object()
      .keys({
        phoneNumber: Joi.string(),
        fullName: Joi.string(),
        address: Joi.string(),
        apartment: Joi.string().allow(''),
        city: Joi.string(),
        postalCode: Joi.string(),
      })
      .required(),
    paymentMethod: Joi.string(),
    paymentResult: Joi.object().keys({
      id: Joi.string(),
      status: Joi.string(),
      email_address: Joi.string(),
    }),
    shippingPrice: Joi.number(),
    shippingMethod: Joi.string().required(),
    totalPrice: Joi.number().required(),
    isPaid: Joi.boolean(),
    isDelivered: Joi.boolean(),
    paidAt: Joi.date(),
    deliveredAt: Joi.date(),
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOderById = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    orderItems: Joi.array().items(
      Joi.object().keys({
        name: Joi.string(),
        quantity: Joi.number(),
        image: Joi.string(),
        price: Joi.number(),
      })
    ),
    shippingAddress: Joi.object().keys({
      phoneNumber: Joi.string(),
      fullName: Joi.string(),
      address: Joi.string(),
      apartment: Joi.string().allow(''),
      city: Joi.string(),
      postalCode: Joi.string(),
    }),
    paymentMethod: Joi.string(),
    paymentResult: Joi.object().keys({
      id: Joi.string(),
      status: Joi.string(),
      email_address: Joi.string(),
    }),
    shippingPrice: Joi.number(),
    shippingMethod: Joi.string(),
    totalPrice: Joi.number(),
    isPaid: Joi.boolean(),
    isDelivered: Joi.boolean(),
    paidAt: Joi.date(),
    deliveredAt: Joi.date(),
  }),
};

const getOrdersByUserId = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const payOrder = {
  query: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    paymentResult: Joi.object(),
  }),
};

module.exports = {
  createOrder,
  getOrderById,
  updateOderById,
  getOrdersByUserId,
  payOrder,
};
