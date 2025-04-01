const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ibSavingsValidation = require('../../validations/ibSavings.validation');
const ibSavingsController = require('../../controllers/ibSavings.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createIbSavingsPackage'),
    validate(ibSavingsValidation.createIbSavingsPackage),
    ibSavingsController.createIbSavingsPackage
  );

module.exports = router;
