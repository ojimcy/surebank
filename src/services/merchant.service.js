const httpStatus = require('http-status');
const { MerchantRequest, Merchant } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a merchant request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createMerchantRequest = async (requestData) => {
  // Ensure that all required fields are present
  if (!requestData.storeName || !requestData.storeAddress || !requestData.storePhoneNumber || !requestData.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  // Check if storeName already exists
  const { storeName } = requestData;
  const existingMerchantRequest = await MerchantRequest.findOne({
    storeName,
  });
  if (existingMerchantRequest) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Store name already exists');
  }

  return MerchantRequest.create(requestData);
};

/**
 * View requests
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const viewRequests = async (filter, options) => {
  const requests = await MerchantRequest.paginate(filter, options);
  return requests;
};

/**
 * View single request
 * @param {ObjectId} id
 * @returns {Promise<MerchantRequest>}
 */
const viewRequest = async (id) => {
  return MerchantRequest.findById(id);
};

/**
 * Cancel a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be cancelled
 * @param {Array} reasons - Reasons for cancelling the request
 * @returns {Promise<Object>} Result of the operation
 */
const cancelMerchantRequest = async (requestId, reasons) => {
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  const updatedRequest = await MerchantRequest.findByIdAndUpdate(requestId, { status: 'canceled', reasons }, { new: true });
  return updatedRequest;
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
const getCancelledRequests = async (filter, options) => {
  const cancelledRequests = await MerchantRequest.paginate({ status: 'cancel', ...filter }, options);
  return cancelledRequests;
};

/**
 * Reject a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be rejected
 * @param {Array} reasons - Reasons for rejecting the request
 * @returns {Promise<Object>} Result of the operation
 */
const denyMerchantRequest = async (requestId, reasons) => {
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  const updatedRequest = await MerchantRequest.findByIdAndUpdate(requestId, { status: 'denied', reasons }, { new: true });
  return updatedRequest;
};

/**
 * Get denied merchant requests with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing denied merchant requests and pagination information
 */
const getDeniedRequests = async (filter, options) => {
  const deniedRequests = await MerchantRequest.paginate({ status: 'denied', ...filter }, options);
  return deniedRequests;
};

/**
 * Approve a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be approved
 * @returns {Promise<Object>} Result of the operation
 */
const approveMerchantRequest = async (requestId) => {
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  await MerchantRequest.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

  // Create an entry in the Merchant model
  const merchantData = {
    userId: merchantRequest.userId,
    merchantRequestId: requestId,
    storeName: merchantRequest.storeName,
    storeAddress: merchantRequest.storeAddress,
    storePhoneNumber: merchantRequest.storePhoneNumber,
    email: merchantRequest.email,
    website: merchantRequest.website,
    status: 'approved',
  };

  const merchant = await Merchant.create(merchantData);

  return merchant;
};

/**
 * Get approved merchant requests with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>} Object containing approved merchant requests and pagination information
 */
const getApprovedRequests = async (filter, options) => {
  const approvedRequests = await MerchantRequest.paginate({ status: 'approved', ...filter }, options);
  return approvedRequests;
};

/**
 * Get merchants
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getMerchants = async (filter, options) => {
  const merchants = await Merchant.paginate(filter, options);
  return merchants;
};

module.exports = {
  createMerchantRequest,
  viewRequests,
  viewRequest,
  cancelMerchantRequest,
  getCancelledRequests,
  denyMerchantRequest,
  getDeniedRequests,
  approveMerchantRequest,
  getApprovedRequests,
  getMerchants,
};
