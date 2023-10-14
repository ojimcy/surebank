const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const storeValidation = require('../../validations/store.validation');
const storeController = require('../../controllers/store.controller');

const router = express.Router();

router
  .route('/categories')
  .post(auth('manageCategory'), validate(storeValidation.createCategory), storeController.createCategory)
  .get(storeController.getCategories);

router
  .route('/brands')
  .post(auth('manageBrands'), validate(storeValidation.createCategory), storeController.createBrand)
  .get(storeController.getBrands);

module.exports = router;
