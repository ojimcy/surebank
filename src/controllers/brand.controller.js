const httpStatus = require('http-status');
const { brandService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createBrand = catchAsync(async (req, res) => {
  const brandData = req.body;
  const brand = await brandService.createBrand(brandData);
  res.status(httpStatus.CREATED).send(brand);
});

const deleteBrand = catchAsync(async (req, res) => {
  const { brandId } = req.params;
  const brand = await brandService.deleteBrand(brandId);
  res.status(httpStatus.OK).send(brand);
});

const updateBrand = catchAsync(async (req, res) => {
  const { brandId } = req.params;
  const updateData = req.body;
  const brand = await brandService.updateBrand(brandId, updateData);
  res.status(httpStatus.OK).send(brand);
});

module.exports = {
  createBrand,
  deleteBrand,
  updateBrand,
};
