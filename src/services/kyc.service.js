const httpStatus = require('http-status');
const { KYC } = require('../models');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');
const { paystackService } = require('./paystack.service');
/**
 * Create a KYC request
 * @param {Object} kycBody
 * @returns {Promise<KYC>}
 */
const createKycRequest = async (kycBody) => {
  // Check if user already has a pending or approved KYC
  const existingKyc = await KYC.findOne({
    userId: kycBody.userId,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingKyc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has a pending or approved KYC request');
  }

  const kyc = await KYC.create(kycBody);

  // Update user's KYC status
  await User.findByIdAndUpdate(kycBody.userId, {
    kycStatus: 'pending',
    kycType: kycBody.type,
  });

  return kyc;
};

/**
 * Query for KYC requests
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryKycRequests = async (filter, options) => {
  const kycs = await KYC.paginate(filter, options);
  return kycs;
};

/**
 * Get KYC request by id
 * @param {ObjectId} id
 * @returns {Promise<KYC>}
 */
const getKycById = async (id) => {
  return KYC.findById(id);
};

/**
 * Update KYC status
 * @param {ObjectId} kycId
 * @param {string} status
 * @param {string} remarks
 * @param {ObjectId} adminId
 * @returns {Promise<KYC>}
 */
const updateKycStatus = async (kycId, status, remarks, adminId) => {
  const kyc = await getKycById(kycId);
  if (!kyc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'KYC request not found');
  }

  if (kyc.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only update pending KYC requests');
  }

  kyc.status = status;
  kyc.remarks = remarks;
  kyc.approvedBy = adminId;
  kyc.approvedAt = Date.now();
  await kyc.save();

  // Update user's KYC status
  await User.findByIdAndUpdate(kyc.userId, {
    kycStatus: status === 'approved' ? 'verified' : 'unverified',
  });

  return kyc;
};

/**
 * Verify BVN
 * @param {string} bvn - Customer's BVN
 * @returns {Promise<Object>} Verified BVN
 */
const verifyBvn = async (bvn) => {
  const response = await paystackService.verifyBvn(bvn);
  return response.data.data;
};

module.exports = {
  createKycRequest,
  queryKycRequests,
  getKycById,
  updateKycStatus,
  verifyBvn,
};
