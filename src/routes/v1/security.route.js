const express = require('express');
const validate = require('../../middlewares/validate');
const securityValidation = require('../../validations/security.validation');
const securityController = require('../../controllers/security.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.route('/otp/send').post(auth('sendOtp'), validate(securityValidation.sendOtp), securityController.sendOtp);

router.route('/2fa/init').post(auth('init2fa'), validate(securityValidation.init2fa), securityController.init2fa);
router.route('/2fa/enable').post(auth('enable2fa'), validate(securityValidation.enable2fa), securityController.enable2fa);

router
  .route('/2fa/disable')
  .post(auth('disable2fa'), validate(securityValidation.disable2fa), securityController.disable2fa);

module.exports = router;
