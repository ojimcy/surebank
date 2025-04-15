const express = require('express');
const { paystackController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { paystackValidation } = require('../../validations');

const router = express.Router();

// Webhook route doesn't need auth middleware since it's called by Paystack
router.post('/webhook', paystackController.webhookHandler);

module.exports = router;
