const httpStatus = require('http-status');
const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');

/**
 * Get categories with pagination and filtering
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>}
 */
const getCategories = async (filter, options) => {
  const CategoryModel = await Category();
  const categories = await CategoryModel.paginate(filter, {
    ...options,
    populate: [
      { path: 'categoryId', select: 'title slug' }
    ]
  });
  return categories;
};

/**
 * Get all categories (without pagination)
 * @returns {Promise<Array>}
 */
const getAllCategories = async () => {
  const CategoryModel = await Category();
  const categories = await CategoryModel.find({})
    .populate('categoryId', 'title slug')
    .sort({ title: 1 });
  return categories;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Object>}
 */
const getCategoryById = async (id) => {
  const CategoryModel = await Category();
  const category = await CategoryModel.findById(id)
    .populate('categoryId', 'title slug');
  
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  
  return category;
};

/**
 * Get category by slug
 * @param {string} slug
 * @returns {Promise<Object>}
 */
const getCategoryBySlug = async (slug) => {
  const CategoryModel = await Category();
  const category = await CategoryModel.findOne({ slug })
    .populate('categoryId', 'title slug');
  
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  
  return category;
};

/**
 * Get categories by parent category id
 * @param {ObjectId} parentId
 * @returns {Promise<Array>}
 */
const getCategoriesByParent = async (parentId) => {
  const CategoryModel = await Category();
  const categories = await CategoryModel.find({ categoryId: parentId })
    .sort({ title: 1 });
  return categories;
};

module.exports = {
  getCategories,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoriesByParent,
};