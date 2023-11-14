const httpStatus = require('http-status');
const { Brand } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Result of the operation
 */
const createBrand = async (brandData) => {
  const BrandModel = await Brand();
  const existingBrand = await BrandModel.findOne({ name: brandData.name });
  if (existingBrand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Brand with the same name already exists');
  }
  return BrandModel.create(brandData);
};

/**
 * View brands requests with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing brands requests and pagination information
 */
const viewBrands = async (filter, options) => {
  const BrandModel = await Brand();
  const brands = await BrandModel.paginate(filter, options);
  return brands;
};

/**
 * Delete a brand by ID
 * @param {string} brandId - Brand ID
 * @returns {Promise<Object>} The deleted brand
 */
const deleteBrand = async (brandId) => {
  const BrandModel = await Brand();
  const brand = await BrandModel.findByIdAndRemove(brandId);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }
  return brand;
};

/**
 * Update a brand by ID
 * @param {string} brandId - Brand ID
 * @param {Object} updateData - Updated brand data
 * @returns {Promise<Object>} The updated brand
 */
const updateBrand = async (brandId, updateData) => {
  const BrandModel = await Brand();
  const brand = await BrandModel.findByIdAndUpdate(brandId, updateData, { new: true });
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }
  return brand;
};

module.exports = {
  createBrand,
  viewBrands,
  deleteBrand,
  updateBrand,
};
