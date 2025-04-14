const httpStatus = require('http-status');
const { KYC } = require('../models');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Submit enhanced KYC data for self-registered users
 * @param {ObjectId} userId
 * @param {Object} kycData
 * @returns {Promise<KYC>}
 */
const submitKycRequest = async (userId, kycData) => {
  // Check if user already has a pending or approved KYC
  const existingKyc = await KYC.findOne({
    userId,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingKyc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You already have a pending or approved KYC request');
  }

  // Prepare KYC data based on type
  const kycBody = {
    userId,
    type: kycData.kycType,
    dateOfBirth: kycData.dateOfBirth,
    phoneNumber: kycData.phoneNumber,
    status: 'pending',
  };

  // Add type-specific fields
  if (kycData.kycType === 'bvn') {
    kycBody.bvn = kycData.bvn;
  } else if (kycData.kycType === 'id') {
    kycBody.type = kycData.idType;
    kycBody.idNumber = kycData.idNumber;
    kycBody.idImage = kycData.idImage;
    kycBody.selfieImage = kycData.selfieImage;
    kycBody.expiryDate = kycData.expiryDate;
  }

  // Create KYC request
  const kyc = await KYC.create(kycBody);

  // Update user's KYC status
  await User.findByIdAndUpdate(userId, {
    kycStatus: 'pending',
    kycType: kycData.kycType,
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

module.exports = {
  submitKycRequest,
  queryKycRequests,
  getKycById,
  updateKycStatus,
};
