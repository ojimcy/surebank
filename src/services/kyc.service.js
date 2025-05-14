const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { User, KYC } = require('../models');
const logger = require('../config/logger');

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
    name: `${user.firstName} ${user.lastName}` || kycData.name,
    type: kycData.kycType,
    dateOfBirth: kycData.dateOfBirth,
    phoneNumber: kycData.phoneNumber,
    status: 'pending',
    submittedAt: new Date(),
  };

  // Add type-specific fields
  if (kycData.kycType === 'bvn') {
    // Store BVN verification reference but not the BVN itself
    kycBody.bvnVerificationReference = `bvn_verification_${Date.now()}_${userId}`;

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

  return kyc;
};

/**
 * Verify a Bank Verification Number (BVN)
 * @param {string} bvn - Bank Verification Number to verify
 * @returns {Promise<Object>} Verification result
 */
const verifyBvn = async (bvn) => {
  try {
    // Basic validation
    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      return {
        success: false,
        message: 'Invalid BVN format. BVN must be 11 digits',
      };
    }

    // In a real implementation, we would call an external BVN verification service here
    // const response = await axios.post(config.bvnVerificationUrl, { bvn });

    // For demonstration purposes, we're mocking a successful verification
    // Replace this with actual API calls in production
    logger.info(`Verifying BVN (masked): ***********${bvn.slice(-2)}`);

    // Simulate API response
    const verificationResult = {
      success: true,
      message: 'BVN verified successfully',
      data: {
        bvn,
        firstName: 'VERIFIED', // This would be returned by the actual BVN service
        lastName: 'VERIFIED',
        dateOfBirth: '1990-01-01',
      },
    };

    return verificationResult;
  } catch (error) {
    logger.error('BVN verification failed:', error);
    return {
      success: false,
      message: (error.response && error.response.data && error.response.data.message) || 'BVN verification failed',
    };
  }
};

/**
 * Update user's BVN
 * @param {ObjectId} userId
 * @param {string} bvn - Bank Verification Number
 * @returns {Promise<User>}
 */
const updateUserBvn = async (userId, bvn) => {
  const UserModel = await User();

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify BVN
  const verificationResult = await verifyBvn(bvn);

  if (!verificationResult.success) {
    throw new ApiError(httpStatus.BAD_REQUEST, verificationResult.message || 'BVN verification failed');
  }

  // Update user's BVN and KYC status
  await UserModel.findByIdAndUpdate(userId, {
    bvnVerified: true,
    bvnVerifiedAt: new Date(),
    kycStatus: 'verified',
    kycType: 'bvn',
    kycSubmittedAt: new Date(),
  });

  // Create KYC record if doesn't exist
  const KYCModel = await KYC();

  // Check if there's an existing KYC for BVN
  const existingKyc = await KYCModel.findOne({
    userId,
    type: 'bvn',
    status: 'approved',
  });

  if (!existingKyc) {
    await KYCModel.create({
      userId,
      type: 'bvn',
      bvnVerified: true,
      bvnVerificationReference: `bvn_verification_${Date.now()}_${userId}`,
      status: 'approved',
      dateOfBirth:
        verificationResult.data && verificationResult.data.dateOfBirth
          ? new Date(verificationResult.data.dateOfBirth)
          : new Date(),
      submittedAt: new Date(),
      approvedAt: new Date(),
    });
  }

  return UserModel.findById(userId);
};

module.exports = {
  submitKycRequest,
  queryKycRequests,
  getKycById,
  updateKycStatus,
  verifyBvn,
  updateUserBvn,
};
