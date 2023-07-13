const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { salesService } = require('../services');
const pick = require('../utils/pick');

const commitSale = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const salesData = req.query;
  await salesService.commitSale(userId, salesData);
  res.status(httpStatus.OK).send({ message: 'Sale committed successfully' });
});

const viewSales = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const filters = pick(req.query, ['paymentStatus', 'status', 'merchantId']);
  const pagination = pick(req.query, ['sortBy', 'limit', 'page']);

  const salesData = await salesService.viewSales(userId, filters, pagination);

  res.send(salesData);
});

const cancelSale = catchAsync(async (req, res) => {
  const { salesId } = req.params;
  const userId = req.user._id;
  const updatedSale = await salesService.cancelSale(salesId, userId);
  res.status(httpStatus.OK).send(updatedSale);
});

const updatePayment = catchAsync(async (req, res) => {
  const { salesId } = req.query;
  const ledger = await salesService.updatePayment(salesId);

  res.status(httpStatus.OK).send(ledger);
});

const deleteSale = catchAsync(async (req, res) => {
  const { salesId } = req.query;
  const result = await salesService.deleteSale(salesId);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  commitSale,
  viewSales,
  cancelSale,
  updatePayment,
  deleteSale,
};
