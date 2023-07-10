const httpStatus = require('http-status');
const { Category, Brand } = require('../models');
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

/**
 * Create a new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Result of the operation
 */
const createBrand = async (brandData) => {
  const existingBrand = await Category.findOne({ name: brandData.name });
  if (existingBrand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Brand with the same name already exists');
  }

  return Brand.create(brandData);
};

module.exports = {
  createCategory,
  createBrand,
};
