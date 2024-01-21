const httpStatus = require('http-status');
const { chargeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const recordDsCharge = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.recordDsCharge({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

const recordSbCharge = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.recordSbCharge({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

module.exports = {
  recordDsCharge,
  recordSbCharge,
};
