const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const chargerValidation = require('../../validations/charge.validation');
const chargeController = require('../../controllers/charge.controller');

const router = express.Router();
router.route('/').post(auth('charge'), validate(chargerValidation.recordCharge), chargeController.recordCharge);

module.exports = router;
