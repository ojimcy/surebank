const httpStatus = require('http-status');
const { chargeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const chageDsCustomer = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.chargeDsCustomer({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

const chargeSbCustomer = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.chargeSbCustomer({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

module.exports = {
  chageDsCustomer,
  chargeSbCustomer,
};
