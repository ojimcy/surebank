const httpStatus = require('http-status');
const { storeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createCategory = catchAsync(async (req, res) => {
  const categoryData = req.body;
  const category = await storeService.createCategory(categoryData);
  res.status(httpStatus.CREATED).send(category);
});
module.exports = {
  createCategory,
};
