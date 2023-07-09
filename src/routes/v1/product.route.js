const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router
  .route('/request')
  .post(auth('productRequest'), validate(productValidation.createProductRequest), productController.createProductRequest)
  .get(auth('productRequest'), validate(productValidation.viewProductRequests), productController.viewProductRequests);

router
  .route('/request/:requestId')
  .patch(auth('productRequest'), validate(productValidation.updateProductRequest), productController.updateProductRequest)
  .delete(auth('productRequest'), validate(productValidation.deleteProductRequest), productController.deleteProductRequest);

module.exports = router;
