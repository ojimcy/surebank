const httpStatus = require('http-status');
const { Category, Brand } = require('../models');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Result of the operation
 */
const createCategory = async (categoryData) => {
  const CategoryModel = await Category();
  const existingCategory = await CategoryModel.findOne({ title: categoryData.title });

  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category with the same title already exists');
  }

  // Create the new category without subcategories
  return CategoryModel.create({
    ...categoryData,
    slug: slugify(categoryData.title),
  });
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
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  const categoryModel = await Category();
  const category = await categoryModel.findById(id);
  return category;
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

/**
 * Get brand by id
 * @param {ObjectId} id
 * @returns {Promise<Brand>}
 */
const getBrandById = async (id) => {
  const brandModel = await Brand();
  const brand = await brandModel.findById(id);
  return brand;
};

/**
 * Update category
 * @param {string} categoryId - The ID of the category catalogue to update
 * @param {Object} updateData - The updated data for the category
 * @returns {Promise<Object>} The updated category
 */
const updateCategory = async (categoryId, updateData) => {
  // Check if the category exists
  const category = getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  Object.assign(category, updateData);
  await category.save();

  return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await category.remove();
  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  createBrand,
  getBrands,
  getBrandById,
  updateCategory,
  deleteCategoryById,
};
