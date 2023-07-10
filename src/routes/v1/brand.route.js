const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const brandValidation = require('../../validations/brand.validation');
const brandController = require('../../controllers/brand.controller');

const router = express.Router();

router.route('/').post(auth('manageBrand'), validate(brandValidation.creatBrand), brandController.createBrand);

module.exports = router;
