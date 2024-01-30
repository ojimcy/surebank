const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');

const checkProductAvailability = catchAsync(async (req, res) => {
  const { productCatalogueId, requestedQuantity } = req.body;
  await orderService.checkProductAvailability(productCatalogueId, requestedQuantity);
  res.status(httpStatus.OK);
});

const updateProductQuantity = catchAsync(async (req, res) => {
  const { productCatalogueId, requestedQuantity } = req.body;
  await orderService.updateProductQuantity(productCatalogueId, requestedQuantity);
  res.status(httpStatus.OK);
});

const createOrder = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const orderDetails = req.body;
  const order = await orderService.createOrder(userId, orderDetails);
  res.status(httpStatus.CREATED).send(order);
});

const getOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.getOrder(orderId);
  res.status(httpStatus.OK).send(order);
});

const getAllOrders = catchAsync(async (req, res) => {
  const { status, branchId, createdBy } = req.query;
  const orders = await orderService.getAllOrders(status, branchId, createdBy);
  res.status(httpStatus.OK).send(orders);
});

const payOrderWithSbBalance = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { packageId, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  // Call the service function to handle the payment
  const updatedOrder = await orderService.payOrderWithSbBalance(packageId, orderId, userId, parsedPage, parsedLimit);

  res.status(httpStatus.OK).json(updatedOrder);
});

const deliverOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.deliverOrder(orderId);
  res.status(httpStatus.OK).send(order);
});

const cancelOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.cancelOrder(orderId);
  res.status(httpStatus.OK).send(order);
});

module.exports = {
  checkProductAvailability,
  updateProductQuantity,
  createOrder,
  getOrder,
  getAllOrders,
  payOrderWithSbBalance,
  deliverOrder,
  cancelOrder,
};
