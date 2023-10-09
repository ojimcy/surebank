const httpStatus = require('http-status');
const { brandService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createBrand = catchAsync(async (req, res) => {
  const brandData = req.body;
  const brand = await brandService.createBrand(brandData);
  res.status(httpStatus.CREATED).send(brand);
});

const viewBrands = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await brandService.viewBrands(filter, options);
  res.status(httpStatus.OK).send(result);
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
  viewBrands,
  deleteBrand,
  updateBrand,
};
