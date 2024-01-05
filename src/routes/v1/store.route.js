const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const storeValidation = require('../../validations/store.validation');
const storeController = require('../../controllers/store.controller');
const brandValidation = require('../../validations/brand.validation');
const brandController = require('../../controllers/brand.controller');

const router = express.Router();

router
  .route('/brands')
  .post(auth('manageBrand'), validate(brandValidation.createBrand), brandController.createBrand)
  .get(auth('manageBrand'), validate(brandValidation.viewBrands), brandController.viewBrands);

router
  .route('/brands/:brandId')
  .patch(auth('manageBrand'), validate(brandValidation.updateBrand), brandController.updateBrand)
  .delete(auth('manageBrand'), validate(brandValidation.deleteBrand), brandController.deleteBrand);

router
  .route('/categories')
  .post(auth('manageCategory'), validate(storeValidation.createCategory), storeController.createCategory)
  .get(storeController.getCategories);

module.exports = router;
