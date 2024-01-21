const httpStatus = require('http-status');
const { chargeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const recordCharge = catchAsync(async (req, res) => {
  const { ...chargeInput } = req.body;
  const createdBy = req.user._id;

  const charge = await chargeService.recordCharge({ ...chargeInput, createdBy });

  res.status(httpStatus.OK).json(charge);
});

module.exports = {
  recordCharge,
};
