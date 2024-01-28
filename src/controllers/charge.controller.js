const httpStatus = require('http-status');
const { chargeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const chageDsCustomer = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.chageDsCustomer({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

const chagerSbCustomer = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.chagerSbCustomer({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

module.exports = {
  chageDsCustomer,
  chagerSbCustomer,
};
