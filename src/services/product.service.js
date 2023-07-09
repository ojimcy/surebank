const httpStatus = require('http-status');
const { ProductRequest, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const { getMerchantByUserId } = require('./merchant.service');

/**
 * Create product request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createProductRequest = async (requestData, userId) => {
  const merchant = await getMerchantByUserId(userId);

  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }
  const checkRequest = await ProductRequest.findOne({
    name: { $regex: `^${requestData.name}$`, $options: 'i' },
  });
  const checkProduct = await Product.findOne({
    name: { $regex: `^${requestData.name}$`, $options: 'i' },
  });

  if (checkProduct || checkRequest) {
    throw new ApiError(`Product with the name ${requestData.name} already exist or requested`);
  }

  return ProductRequest.create({ ...requestData, merchantId: merchant._id });
};

/**
 * Get cancelled merchant requests with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing cancelled merchant requests and pagination information
 */
const viewProductRequests = async (filter, options) => {
  const productRequests = await ProductRequest.paginate({ status: 'cancel', ...filter }, options);
  return productRequests;
};

/**
 * Update product request
 * @param {string} requestId - The ID of the product request to update
 * @param {string} merchantId - The ID of the requesting merchant
 * @param {Object} updateData - The updated data for the product request
 * @returns {Promise<Object>} The updated product request
 */
const updateProductRequest = async (requestId, merchantId, updateData) => {
  // Check if the product request exists
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (productRequest.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Update the product request with the provided data
  Object.assign(productRequest, updateData);
  await productRequest.save();

  return productRequest;
};

/**
 * Delete product request
 * @param {string} requestId - The ID of the product request to delete
 * @param {string} merchantId - The ID of the requesting merchant
 * @returns {Promise<Object>} The deleted product request
 */
const deleteProductRequest = async (requestId, merchantId) => {
  // Check if the product request exists
  const productRequest = await ProductRequest.findById(requestId);
  if (!productRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product request not found');
  }

  // Check if the product request belongs to the requesting merchant
  if (productRequest.merchantId.toString() !== merchantId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Delete the product request
  await ProductRequest.findByIdAndRemove(requestId);

  return productRequest;
};

module.exports = {
  createProductRequest,
  viewProductRequests,
  updateProductRequest,
  deleteProductRequest,
};
