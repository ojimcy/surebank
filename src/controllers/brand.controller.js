const httpStatus = require('http-status');
const { brandService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createBrand = catchAsync(async (req, res) => {
  const brandData = req.body;
  const brand = await brandService.createBrand(brandData);
  res.status(httpStatus.CREATED).send(brand);
});

module.exports = {
  createBrand,
};
