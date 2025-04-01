const httpStatus = require('http-status');
const { ibSavingsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createIbSavingsPackage = catchAsync(async (req, res) => {
  const ibInput = req.body;
  const startDate = new Date().getTime();
  const createdBy = req.user._id;
  const totalContribution = 0;
  const accruedInterest = 0;
  const status = 'open';

  const createdPackage = await ibSavingsService.createIbSavingsPackage({
    ...ibInput,
    startDate,
    createdBy,
    totalContribution,
    accruedInterest,
    status,
  });

  res.status(httpStatus.CREATED).json(createdPackage);
});

module.exports = {
  createIbSavingsPackage,
};
