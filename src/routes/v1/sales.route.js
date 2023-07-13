const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const salesValidation = require('../../validations/sales.validation');
const salesController = require('../../controllers/sales.contoller');

const router = express.Router();
router
  .route('/')
  .post(auth('salesOperations'), validate(salesValidation.commitSale), salesController.commitSale)

  .get(auth('salesOperations'), validate(salesValidation.viewSales), salesController.viewSales);

router
  .route('/:salesId/')
  .delete(auth('manageSales'), validate(salesValidation.updatePayment), salesController.deleteSale)
  .post(auth('manageSales'), validate(salesValidation.updatePayment), salesController.updatePayment);

router.route('/:salesId/calcel').post(auth('manageSales'), validate(salesValidation.cancelSale), salesController.cancelSale);

module.exports = router;
