const httpStatus = require('http-status');
const { MerchantRequest, Merchant, MerchantAdmin } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a merchant request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Result of the operation
 */
const createMerchantRequest = async (requestData) => {
  const MerchantRequestModel = await MerchantRequest();

  // Check if storeName already exists
  const { storeName } = requestData;
  const existingMerchantRequest = await MerchantRequestModel.findOne({
    storeName,
  });
  if (existingMerchantRequest) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Store name already exists');
  }

  return MerchantRequestModel.create(requestData);
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
  const MerchantRequestModel = await MerchantRequest();
  const requests = await MerchantRequestModel.paginate(filter, options);
  return requests;
};

/**
 * View single request
 * @param {ObjectId} id
 * @returns {Promise<MerchantRequest>}
 */
const viewRequest = async (id) => {
  const MerchantRequestModel = await MerchantRequest();
  return MerchantRequestModel.findById(id);
};

/**
 * Cancel a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be cancelled
 * @param {Array} reasons - Reasons for cancelling the request
 * @returns {Promise<Object>} Result of the operation
 */
const cancelMerchantRequest = async (requestId, reasons) => {
  const MerchantRequestModel = await MerchantRequest();
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  const updatedRequest = await MerchantRequestModel.findByIdAndUpdate(
    requestId,
    { status: 'canceled', reasons },
    { new: true }
  );
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
  const MerchantRequestModel = await MerchantRequest();
  const cancelledRequests = await MerchantRequestModel.paginate({ status: 'cancel', ...filter }, options);
  return cancelledRequests;
};

/**
 * Reject a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be rejected
 * @param {Array} reasons - Reasons for rejecting the request
 * @returns {Promise<Object>} Result of the operation
 */
const denyMerchantRequest = async (requestId, reasons) => {
  const MerchantRequestModel = await MerchantRequest();
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  const updatedRequest = await MerchantRequestModel.findByIdAndUpdate(
    requestId,
    { status: 'denied', reasons },
    { new: true }
  );
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
  const MerchantRequestModel = await MerchantRequest();
  const deniedRequests = await MerchantRequestModel.paginate({ status: 'denied', ...filter }, options);
  return deniedRequests;
};

/**
 * Approve a merchant request
 * @param {ObjectId} requestId - ID of the merchant request to be approved
 * @returns {Promise<Object>} Result of the operation
 */
const approveMerchantRequest = async (requestId) => {
  const MerchantRequestModel = await MerchantRequest();
  const MerchantModel = await Merchant();
  const merchantRequest = await viewRequest(requestId);
  if (!merchantRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant request not found');
  }

  await MerchantRequestModel.findByIdAndUpdate(requestId, { status: 'approved' }, { new: true });

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

  const merchant = await MerchantModel.create(merchantData);

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
  const MerchantRequestModel = await MerchantRequest();
  const approvedRequests = await MerchantRequestModel.paginate({ status: 'approved', ...filter }, options);
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
  const MerchantModel = await Merchant();
  const merchants = await MerchantModel.paginate(filter, options);
  return merchants;
};

/**
 * Get merchant by id
 * @param {ObjectId} id
 * @returns {Promise<Merchant>}
 */
const getMerchant = async (id) => {
  const MerchantModel = await Merchant();
  return MerchantModel.findById(id);
};

const getMerchantByUserId = async (userId) => {
  const MerchantModel = await Merchant();
  const merchant = await MerchantModel.findOne({ userId });
  return merchant;
};

/**
 * Add a merchant admin
 * @param {ObjectId} merchantId - ID of the merchant
 * @param {ObjectId} userId - ID of the admin
 * @param {string} role - Role of the admin
 * @returns {Promise<Object>} Result of the operation
 */
const addMerchantAdmin = async (merchantId, userId, loggedInUserId, role) => {
  const MerchantAdminModel = await MerchantAdmin();
  // Find the Merchant document that was created by the logged-in user
  const merchant = await getMerchant(merchantId);

  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  // Check that the logged-in user is the owner of the Merchant
  if (merchant.userId.toString() !== loggedInUserId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action');
  }

  // Check if the admin entry already exists
  const existingAdmin = await MerchantAdminModel.findOne({ merchantId, userId, role });

  if (existingAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate entry');
  }

  // Create a new MerchantAdmin document
  return MerchantAdminModel.create({
    merchantId,
    userId,
    loggedInUserId,
    role,
  });
};

/**
 * Remove a merchant admin
 * @param {ObjectId} merchantId - ID of the merchant
 * @param {ObjectId} adminId - ID of the admin to be removed
 * @param {ObjectId} loggedInUserId - ID of the logged-in user
 * @returns {Promise<Object>} Result of the operation
 */
const removeMerchantAdmin = async (merchantId, adminId, loggedInUserId) => {
  const MerchantAdminModel = await MerchantAdmin();
  // Find the Merchant document that was created by the logged-in user
  const merchant = await getMerchant(merchantId);

  // Check that the Merchant document was found
  if (!merchant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
  }

  // Check that the logged-in user is the owner of the Merchant
  if (merchant.userId.toString() !== loggedInUserId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action');
  }

  // Find the MerchantAdmin document for the specified admin ID
  const admin = await MerchantAdminModel.findOne({ merchantId, userId: adminId });

  // Check if the admin exists
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  // Remove the admin
  await admin.remove();

  return { success: true, message: 'Admin removed successfully' };
};

/**
 * List of merchant admins
 * @param {ObjectId} merchantId
 * @returns {Promise<Merchant>}
 */
const listMerchantAdmins = async (merchantId) => {
  const MerchantAdminModel = await MerchantAdmin();
  const merchantAdmins = await MerchantAdminModel.find({ merchantId });
  return merchantAdmins;
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
  getMerchant,
  getMerchantByUserId,
  addMerchantAdmin,
  removeMerchantAdmin,
  listMerchantAdmins,
};
