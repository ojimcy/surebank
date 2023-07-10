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

module.exports = {
  createBrand,
};
