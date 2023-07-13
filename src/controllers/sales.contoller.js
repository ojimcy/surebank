const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { salesService } = require('../services');
const pick = require('../utils/pick');

const commitSale = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const salesData = { ...req.body };
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

module.exports = {
  commitSale,
  viewSales,
};
