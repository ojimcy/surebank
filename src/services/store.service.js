const httpStatus = require('http-status');
const { Category, Brand } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Result of the operation
 */
const createCategory = async (categoryData) => {
  const CategoryModel = await Category();
  const existingCategory = await CategoryModel.findOne({ name: categoryData.name });
  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category with the same name already exists');
  }
  return CategoryModel.create(categoryData);
};

/**
 * Get all categories
 * @returns {Promise<Array>} List of categories
 */
const getCategories = async () => {
  const CategoryModel = await Category();
  return CategoryModel.find();
};

/**
 * Create a new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Result of the operation
 */
const createBrand = async (brandData) => {
  const BrandModel = await Brand();
  const CategoryModel = await Category();
  const existingBrand = await CategoryModel.findOne({ name: brandData.name });
  if (existingBrand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Brand with the same name already exists');
  }

  return BrandModel.create(brandData);
};

/**
 * Get all brands
 * @returns {Promise<Array>} List of brands
 */
const getBrands = async () => {
  const BrandModel = await Brand();
  return BrandModel.find();
};

module.exports = {
  createCategory,
  getCategories,
  createBrand,
  getBrands,
};
