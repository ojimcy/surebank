const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { kycService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * Enhanced KYC submission for self-registered users
 */
const submitKycRequest = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const kycData = req.body;

  const kyc = await kycService.submitKycRequest(userId, kycData);
  res.status(httpStatus.CREATED).send(kyc);
});

const getKycRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'type', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await kycService.queryKycRequests(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getKycRequestById = catchAsync(async (req, res) => {
  const kyc = await kycService.getKycById(req.params.kycId);
  if (!kyc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'KYC request not found');
  }
  res.status(httpStatus.OK).send(kyc);
});

const approveKycRequest = catchAsync(async (req, res) => {
  const { kycId } = req.params;
  const { status, remarks } = req.body;
  const adminId = req.user._id;
  const kyc = await kycService.updateKycStatus(kycId, status, remarks, adminId);
  res.status(httpStatus.OK).send(kyc);
});

module.exports = {
  submitKycRequest,
  getKycRequests,
  getKycRequestById,
  approveKycRequest,
};
