const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { User, KYC } = require('../models');
const logger = require('../config/logger');
const { virtualAccountService } = require('.');

/**
 * Submit enhanced KYC data for self-registered users
 * @param {ObjectId} userId
 * @param {Object} kycData
 * @returns {Promise<KYC>}
 */
const submitKycRequest = async (userId, kycData) => {
  const KYCModel = await KYC();
  const UserModel = await User();

  // Check if user already has a pending or approved KYC
  const existingKyc = await KYCModel.findOne({
    userId,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingKyc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You already have a pending or approved KYC request');
  }

  // Get user to verify existence
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Prepare KYC data based on type
  const kycBody = {
    userId,
    type: kycData.kycType,
    dateOfBirth: kycData.dateOfBirth,
    phoneNumber: kycData.phoneNumber,
    status: 'pending',
    submittedAt: new Date(),
  };

  // Add type-specific fields
  if (kycData.kycType === 'bvn') {
    kycBody.bvn = kycData.bvn;

    // Additional validation could be added here
    if (kycData.bvn.length !== 11) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'BVN must be 11 digits');
    }
  } else if (kycData.kycType === 'id') {
    kycBody.idType = kycData.idType;
    kycBody.idNumber = kycData.idNumber;
    kycBody.idImage = kycData.idImage;
    kycBody.selfieImage = kycData.selfieImage;
    kycBody.expiryDate = kycData.expiryDate;
    kycBody.address = kycData.address;

    // Validate ID expiry date
    if (new Date(kycData.expiryDate) < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'ID has expired');
    }
  }

  // Create KYC request
  const kyc = await KYCModel.create(kycBody);

  // Update user's KYC status
  await UserModel.findByIdAndUpdate(userId, {
    kycStatus: 'pending',
    kycType: kycData.kycType,
    kycSubmittedAt: new Date(),
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
  const KYCModel = await KYC();
  const kycs = await KYCModel.paginate(filter, options);
  return kycs;
};

/**
 * Get KYC request by id
 * @param {ObjectId} id
 * @returns {Promise<KYC>}
 */
const getKycById = async (id) => {
  const KYCModel = await KYC();
  return KYCModel.findById(id);
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
  const KYCModel = await KYC();
  const UserModel = await User();

  const kyc = await KYCModel.findById(kycId);
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
  await UserModel.findByIdAndUpdate(kyc.userId, {
    kycStatus: status === 'approved' ? 'verified' : 'unverified',
  });

  // If KYC is approved, create a virtual account for the user
  if (status === 'approved') {
    // Schedule virtual account creation as a separate async process
    // This allows us to avoid circular dependencies and not block the KYC approval
    setTimeout(() => {
      try {
        // Require the service only when needed to avoid circular dependency

        virtualAccountService
          .createVirtualAccountAfterKyc(kyc.userId)
          .then((account) => {
            if (account) {
              logger.info(`Virtual account successfully created for user ${kyc.userId} after KYC approval`);
            } else {
              logger.warn(`Failed to create virtual account for user ${kyc.userId} after KYC approval`);
            }
          })
          .catch((error) => {
            logger.error(`Error creating virtual account for user ${kyc.userId} after KYC approval:`, error);
          });
      } catch (error) {
        logger.error(`Error importing virtualAccountService for user ${kyc.userId}:`, error);
      }
    }, 100); // Small delay to ensure KYC update completes first
  }

  return kyc;
};

module.exports = {
  submitKycRequest,
  queryKycRequests,
  getKycById,
  updateKycStatus,
};
