const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const merchantValidation = require('../../validations/merchant.validation');
const merchantController = require('../../controllers/merchant.controller');

const router = express.Router();

router.route('/').get(auth('merchantRequest'), validate(merchantValidation.getMerchants), merchantController.getMerchants);

router
  .route('/request')
  .post(auth('request'), validate(merchantValidation.createMerchantRequest), merchantController.createMerchantRequest)
  .get(auth('merchantRequest'), validate(merchantValidation.viewRequests), merchantController.viewRequests);

router
  .route('/:requestId/request')
  .get(auth('request'), validate(merchantValidation.manageRequest), merchantController.viewRequest);

router
  .route('/:requestId/cancel')
  .post(auth('merchantRequest'), validate(merchantValidation.cancelledRequest), merchantController.cancelMerchantRequest);

router
  .route('/canceled')
  .get(auth('merchantRequest'), validate(merchantValidation.viewRequests), merchantController.getCancelledRequests);

router
  .route('/:requestId/deny')
  .post(auth('merchantRequest'), validate(merchantValidation.denyRequest), merchantController.denyMerchantRequest);

router
  .route('/denied')
  .get(auth('merchantRequest'), validate(merchantValidation.viewRequests), merchantController.getDeniedRequests);

router
  .route('/:requestId/approve')
  .post(auth('merchantRequest'), validate(merchantValidation.approveRequest), merchantController.approveMerchantRequest);

router
  .route('/approved')
  .get(auth('merchantRequest'), validate(merchantValidation.viewRequests), merchantController.getApprovedRequests);

module.exports = router;
