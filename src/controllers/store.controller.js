const httpStatus = require('http-status');
const { storeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCategory = catchAsync(async (req, res) => {
  const categoryData = req.body;
  const category = await storeService.createCategory(categoryData);
  res.status(httpStatus.CREATED).send(category);
});

const createBrand = catchAsync(async (req, res) => {
  const brandData = req.body;
  const brand = await storeService.createBrand(brandData);
  res.status(httpStatus.CREATED).send(brand);
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await storeService.getCategories();
  res.status(httpStatus.OK).send(categories);
});

const getBrands = catchAsync(async (req, res) => {
  const brands = await storeService.getBrands();
  res.status(httpStatus.OK).send(brands);
});

const updateCatgory = catchAsync(async (req, res) => {
  const category = await storeService.updateCategory(req.params.categoryId, req.body);
  res.send(category);
});

const deleteCatgory = catchAsync(async (req, res) => {
  await storeService.deleteCategoryById(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCategory,
  createBrand,
  getCategories,
  getBrands,
  updateCatgory,
  deleteCatgory,
};
