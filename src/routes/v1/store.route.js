const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const storeValidation = require('../../validations/store.validation');
const storeController = require('../../controllers/store.controller');

const router = express.Router();

router
  .route('/category')
  .post(auth('manageCategory'), validate(storeValidation.createProductRequest), storeController.createCategory);

module.exports = router;
