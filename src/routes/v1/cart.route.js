const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartValidation = require('../../validations/cart.validation');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();
router
  .route('/')
  .post(auth('manageCart'), validate(cartValidation.addToCart), cartController.addToCart)
  .get(auth('manageCart'), cartController.viewCartItems)
  .delete(auth('manageCart'), validate(cartValidation.removeCartItem), cartController.removeCartItem);

router.route('/clear').post(auth('manageCart'), validate(cartValidation.clearCart), cartController.clearCart);
router
  .route('/increase')
  .post(auth('manageCart'), validate(cartValidation.increaseQuantity), cartController.increaseQuantity);
router
  .route('/decrease')
  .post(auth('manageCart'), validate(cartValidation.increaseQuantity), cartController.decreaseQuantity);

module.exports = router;
