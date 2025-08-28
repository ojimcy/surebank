const httpStatus = require('http-status');
const { categoryService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'slug']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  options.limit = parseInt(options.limit, 10) || 50;
  options.page = parseInt(options.page, 10) || 1;
  
  const result = await categoryService.getCategories(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  res.status(httpStatus.OK).send(category);
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(httpStatus.OK).send(categories);
});

module.exports = {
  getCategories,
  getCategoryById,
  getAllCategories,
};