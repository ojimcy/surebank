const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const brandValidation = require('../../validations/brand.validation');
const brandController = require('../../controllers/brand.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageBrand'), validate(brandValidation.createBrand), brandController.createBrand)
  .get(auth('manageBrand'), validate(brandValidation.viewBrands), brandController.viewBrands);

router
  .route('/:brandId')
  .patch(auth('manageBrand'), validate(brandValidation.updateBrand), brandController.updateBrand)
  .delete(auth('manageBrand'), validate(brandValidation.deleteBrand), brandController.deleteBrand);

module.exports = router;
