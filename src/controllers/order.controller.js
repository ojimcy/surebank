const httpStatus = require('http-status');
const { orderService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createOrder = catchAsync(async (req, res) => {
  const orderData = req.body;
  const order = await orderService.createOrder(orderData);
  res.status(httpStatus.CREATED).send(order);
});

const getAllOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.status(httpStatus.OK).send(orders);
});

const getOrderById = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.getOrderById(orderId);
  res.status(httpStatus.OK).send(order);
});

const updateOderById = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const updateData = req.body;
  const updatedOrder = await orderService.updateOrderById(orderId, updateData);
  res.status(httpStatus.OK).send(updatedOrder);
});

const getOrdersByUserId = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const orders = await orderService.getOrdersByUserId(userId);
  res.status(httpStatus.OK).send(orders);
});

const payOrder = catchAsync(async (req, res) => {
  const { paymentData } = req.body;
  const { orderId } = req.query;

  const paidOrder = await orderService.payOrder(orderId, paymentData);

  res.status(httpStatus.OK).send(paidOrder);
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOderById,
  getOrdersByUserId,
  payOrder,
};
