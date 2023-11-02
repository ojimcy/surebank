const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const collectionController = require('../../controllers/order.controller');

const router = express.Router();
router
  .route('/')
  .get(auth('order'), collectionController.getAllOrders)
  .post(auth('order'), validate(orderValidation.createOrder), collectionController.createOrder);

router
  .route('/user')
  .get(auth('order'), validate(orderValidation.getOrdersByUserId), collectionController.getOrdersByUserId);

router.route('/:orderId/pay').post(auth('order'), validate(orderValidation.payOrder), collectionController.payOrder);

router
  .route('/:orderId')
  .get(auth('order'), validate(orderValidation.getOrderById), collectionController.getOrderById)
  .patch(auth('order'), validate(orderValidation.updateOderById), collectionController.updateOderById);

module.exports = router;
