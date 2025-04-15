const express = require('express');
const { paystackController } = require('../../controllers');

const router = express.Router();

// Webhook route doesn't need auth middleware since it's called by Paystack
router.post('/webhook', paystackController.webhookHandler);

module.exports = router;
