const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { packageService, paymentService } = require('../services');

const createSelfPackage = catchAsync(async (req, res) => {
  const newPackage = await packageService.createSelfPackage(req.body);
  res.status(httpStatus.CREATED).send(newPackage);
});

const initializeDailySavingsContribution = catchAsync(async (req, res) => {
  const result = await paymentService.initializeDailySavingsContribution(req.body);
  res.status(httpStatus.OK).json(result);
});

const confirmDailySavingsContribution = catchAsync(async (req, res) => {
  const result = await paymentService.handleDailySavingsContribution(req.body);
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createSelfPackage,
  initializeDailySavingsContribution,
  confirmDailySavingsContribution,
};
