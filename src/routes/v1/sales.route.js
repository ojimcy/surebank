const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const salesValidation = require('../../validations/sales.validation');
const salesController = require('../../controllers/sales.contoller');

const router = express.Router();
router.route('/').post(auth('salesOperations'), validate(salesValidation.commitSale), salesController.commitSale);

router.route('/:salesRepId').get(auth('salesOperations'), validate(salesValidation.viewSales), salesController.viewSales);

module.exports = router;
