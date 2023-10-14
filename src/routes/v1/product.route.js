const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const router = express.Router();
router.route('/').get(auth('getProducts'), validate(productValidation.viewProducts), productController.viewProducts);

router
  .route('/request')
  .post(auth('productRequest'), validate(productValidation.createProductRequest), productController.createProductRequest)
  .get(auth('productRequest'), validate(productValidation.viewProductRequests), productController.viewProductRequests);

router
  .route('/:productId')
  .get(auth('getProducts'), validate(productValidation.viewProduct), productController.viewProduct)
  .patch(auth('manageProduct'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProduct'), validate(productValidation.deleteProduct), productController.deleteProduct);

router
  .route('/request/:requestId')
  .patch(auth('productRequest'), validate(productValidation.updateProductRequest), productController.updateProductRequest)
  .delete(auth('productRequest'), validate(productValidation.deleteProductRequest), productController.deleteProductRequest);

router
  .route('/request/:requestId/approve')
  .post(
    auth('manageProductRequest'),
    validate(productValidation.approveProductRequest),
    productController.approveProductRequest
  );

router
  .route('/request/:requestId/reject')
  .post(auth('manageProductRequest'), validate(productValidation.rejectProduct), productController.rejectProduct);

router
  .route('/cat/create')
  .post(
    auth('productCatalogue'),
    validate(productValidation.createProductCatalogue),
    productController.createProductCatalogue
  );

router
  .route('/collections')
  .post(auth('manageProduct'), validate(productValidation.addProductToCollection), productController.addProductToCollection)
  .get(validate(productValidation.getProductsByCollectionSlug), productController.getProductsByCollectionSlug);

module.exports = router;
