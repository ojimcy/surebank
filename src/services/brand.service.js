const httpStatus = require('http-status');
const { Brand } = require('../models');
const ApiError = require('../utils/ApiError');

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
 * Delete a brand by ID
 * @param {string} brandId - Brand ID
 * @returns {Promise<Object>} The deleted brand
 */
const deleteBrand = async (brandId) => {
  const brand = await Brand.findByIdAndRemove(brandId);
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
  const brand = await Brand.findByIdAndUpdate(brandId, updateData, { new: true });
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }
  return brand;
};

module.exports = {
  createBrand,
  deleteBrand,
  updateBrand,
};
