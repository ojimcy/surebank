const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { packageService } = require('../services');

const createSelfPackage = catchAsync(async (req, res) => {
  const newPackage = await packageService.createSelfPackage(req.body);
  res.status(httpStatus.CREATED).send(newPackage);
});

module.exports = {
  createSelfPackage,
};
