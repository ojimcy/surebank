const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const smsValidation = require('../../validations/sms.validation');
const smsController = require('../../controllers/sms.controller');

const router = express.Router();

router.route('/').post(auth('sendSms'), validate(smsValidation.sendBulkSms), smsController.sendBulkSms);

module.exports = router;
