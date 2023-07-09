const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Result of the operation
 */
const createCategory = async (categoryData) => {
  const existingCategory = await Category.findOne({ name: categoryData.name });
  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category with the same name already exists');
  }

  return Category.create(categoryData);
};

module.exports = {
  createCategory,
};
