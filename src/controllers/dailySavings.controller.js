const httpStatus = require('http-status');
const { dailySavingsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createDailySavingsPackage = catchAsync(async (req, res) => {
  const dailyInput = req.body;
  const startDate = new Date().getTime();
  const userReps = req.user._id;
  const totalContribution = 0;
  const status = 'open';
  const createdPackage = await dailySavingsService.createDailySavingsPackage({
    ...dailyInput,
    startDate,
    userReps,
    totalContribution,
    status,
  });
  res.status(httpStatus.OK).send(createdPackage);
});

module.exports = {
  createDailySavingsPackage,
};
