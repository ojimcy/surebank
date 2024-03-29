const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/order.controller');

const router = express.Router();
router
  .route('/')
  .post(auth('orderOperations'), validate(orderValidation.createOrder), orderController.createOrder)
  .get(auth('orderOperations'), validate(orderValidation.getAllOrders), orderController.getAllOrders);

router
  .route('/:orderId/sb-pay')
  .post(auth('orderOperations'), validate(orderValidation.payOrderWithSbBalance), orderController.payOrderWithSbBalance);

router.route('/:orderId').get(auth('orderOperations'), validate(orderValidation.getOrder), orderController.getOrder);

router
  .route('/:orderId/deliver')
  .post(auth('manageOrder'), validate(orderValidation.getOrder), orderController.deliverOrder);
router.route('/:orderId/cancel').post(auth('manageOrder'), validate(orderValidation.getOrder), orderController.cancelOrder);

module.exports = router;
