const express = require('express');
const validate = require('../../middlewares/validate');
const paymentController = require('../../controllers/payment.controller');
const auth = require('../../middlewares/auth');
const { initializeDailySavingsPayment } = require('../../validations/payment.validation');

const router = express.Router();

// User-initiated payment endpoints (protected by auth)
router
  .route('/daily-savings/initiate')
  .post(auth(), validate(initializeDailySavingsPayment), paymentController.initializeDailySavingsPayment);

router.route('/verify').get(paymentController.verifyPayment);

// Paystack webhook endpoint (public)
router.post('/webhook/paystack', paymentController.handlePaystackWebhook);

module.exports = router;
