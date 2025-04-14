const Joi = require('joi');
const { objectId } = require('./custom.validation');

const submitKycBVN = {
  body: Joi.object().keys({
    bvn: Joi.string().required().length(11),
    dateOfBirth: Joi.date().required(),
    phoneNumber: Joi.string().required(),
  }),
};

const submitKycID = {
  body: Joi.object().keys({
    idType: Joi.string().required().valid('passport', 'drivers_license', 'national_id', 'voters_card'),
    idNumber: Joi.string().required(),
    idImage: Joi.string().required(), // URL/path to uploaded ID image
    selfieImage: Joi.string().required(), // URL/path to uploaded selfie
    dateOfBirth: Joi.date().required(),
    expiryDate: Joi.date().required(),
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
  submitKycBVN,
  submitKycID,
  approveKyc,
  getKycRequests,
  verifyBvn,
  getKycById,
};
