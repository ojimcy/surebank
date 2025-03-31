const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const kycValidation = require('../../validations/kyc.validation');
const kycController = require('../../controllers/kyc.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('submitKyc'), validate(kycValidation.submitKycBVN), kycController.submitKycRequest)
  .get(auth('getKycs'), validate(kycValidation.getKycRequests), kycController.getKycRequests);

router
  .route('/:kycId')
  .get(auth('getKycs'), validate(kycValidation.getKycById), kycController.getKycRequestById)
  .post(auth('manageKyc'), validate(kycValidation.approveKyc), kycController.approveKycRequest);

module.exports = router;
