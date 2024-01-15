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
  const existingCategory = await Category.findOne({ title: categoryData.title });

  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category with the same title already exists');
  }

  // Check if subcategories are provided
  if (categoryData.subCategories && categoryData.subCategories.length > 0) {
    // Check for existing subcategories
    const existingSubcategories = await Category.find({
      'subCategories.heading': { $in: categoryData.subCategories.map((subcat) => subcat.heading) },
    });

    if (existingSubcategories.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more subcategories already exist');
    }

    // Update subcategories with slugs
    const updatedSubCategories = categoryData.subCategories.map((subcategory) => ({
      heading: subcategory.heading,
      items: subcategory.items.map((item) => ({
        title: item.title,
        slug: slugify(categoryData.title),
      })),
    }));

    // Create the new category with subcategories
    const updatedCategoryData = {
      ...categoryData,
      slug: slugify(categoryData.title),
      subCategories: updatedSubCategories,
    };

    return Category.create(updatedCategoryData);
  }
  // Create the new category without subcategories
  return Category.create({
    ...categoryData,
    slug: slugify(categoryData.title),
  });
};

/**
 * Get all categories
 * @returns {Promise<Array>} List of categories
 */
const getCategories = async () => {
  return Category.find();
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  return category;
};

/**
 * Create a new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Result of the operation
 */
const createBrand = async (brandData) => {
  const existingBrand = await Brand.findOne({ name: brandData.name });
  if (existingBrand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Brand with the same name already exists');
  }

  return Brand.create(brandData);
};

/**
 * Get all brands
 * @returns {Promise<Array>} List of brands
 */
const getBrands = async () => {
  return Brand.find();
};

/**
 * Get brand by id
 * @param {ObjectId} id
 * @returns {Promise<Brand>}
 */
const getBrandById = async (id) => {
  const brand = await Brand.findById(id);
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
