const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Enhanced KYC validation for self-registered users
const submitKyc = {
  body: Joi.object().keys({
    kycType: Joi.string().required().valid('bvn', 'id'),
    // BVN specific fields
    bvn: Joi.string().length(11).when('kycType', {
      is: 'bvn',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    // ID specific fields
    idType: Joi.string().valid('passport', 'drivers_license', 'national_id', 'voters_card').when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    idNumber: Joi.string().when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    idImage: Joi.string().when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    selfieImage: Joi.string().when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    expiryDate: Joi.date().when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    address: Joi.string().when('kycType', {
      is: 'id',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    // Common fields
    dateOfBirth: Joi.date().required(),
    phoneNumber: Joi.string().required(),
  }),
};

const approveKyc = {
  params: Joi.object().keys({
    kycId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('approved', 'rejected'),
    remarks: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

const getKycRequests = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    type: Joi.string().valid('bvn', 'id'),
    userId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const verifyBvn = {
  body: Joi.object().keys({
    bvn: Joi.string().required().length(11),
  }),
};

const getKycById = {
  params: Joi.object().keys({
    kycId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  submitKyc,
  approveKyc,
  getKycRequests,
  verifyBvn,
  getKycById,
};
