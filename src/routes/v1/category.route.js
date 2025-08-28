const express = require('express');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations/category.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router
  .route('/')
  .get(validate(categoryValidation.getCategories), categoryController.getCategories);

router
  .route('/all')
  .get(categoryController.getAllCategories);

router
  .route('/:categoryId')
  .get(validate(categoryValidation.getCategory), categoryController.getCategoryById);

module.exports = router;