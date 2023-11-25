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

  // Check if subcategories are provided
  if (categoryData.subCategories && categoryData.subCategories.length > 0) {
    // Check for existing subcategories
    const existingSubcategories = await CategoryModel.find({
      'subCategories.heading': { $in: categoryData.subCategories.map((subcat) => subcat.heading) },
    });

    if (existingSubcategories.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more subcategories already exist');
    }

    // Update subcategories with slugs
    const updatedSubCategories = categoryData.subCategories.map((subcategory) => ({
      heading: subcategory.heading,
      items: subcategory.items.map((item) => ({
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      })),
    }));

    // Create the new category with subcategories
    const updatedCategoryData = {
      ...categoryData,
      slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      subCategories: updatedSubCategories,
    };

    return CategoryModel.create(updatedCategoryData);
  }
  // Create the new category without subcategories
  return CategoryModel.create({
    ...categoryData,
    slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
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

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  createBrand,
  getBrands,
  getBrandById,
};
