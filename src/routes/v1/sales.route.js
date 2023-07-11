const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cartValidation = require('../../validations/cart.validation');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();
router.route('/').post(auth('comitSales'), validate(cartValidation.commitSale), cartController.commitSale);

module.exports = router;
