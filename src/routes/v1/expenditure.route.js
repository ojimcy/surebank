const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const expenditureValidation = require('../../validations/expenditure.validation');
const expenditureController = require('../../controllers/expenditure.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageExpenditure'),
    validate(expenditureValidation.createExpenditure),
    expenditureController.createExpenditure
  )
  .get(
    auth('manageExpenditure'),
    validate(expenditureValidation.getExpendituresByDateRange),
    expenditureController.getExpendituresByDateRange
  );

router.route('/total').get(auth('manageExpenditure'), expenditureController.getTotalExpenditure);
router.route('/user-reps').get(auth('manageExpenditure'), expenditureController.getExpendituresByUserReps);
router.route('/total/admin').get(auth('manageExpenditure'), expenditureController.getBranchTotalExpenditure);
router.route('/total/supperadmin').get(auth('manageExpenditure'), expenditureController.getTotalExpenditure);

router
  .route('/:expenditureId')
  .get(
    auth('manageExpenditure'),
    validate(expenditureValidation.getExpenditureById),
    expenditureController.getExpenditureById
  )
  .patch(
    auth('manageExpenditure'),
    validate(expenditureValidation.updateExpenditure),
    expenditureController.updateExpenditure
  )
  .delete(
    auth('manageExpenditure'),
    validate(expenditureValidation.deleteExpenditure),
    expenditureController.deleteExpenditure
  );

router
  .route('/:expenditureId/approve')
  .post(
    auth('approveExpenditure'),
    validate(expenditureValidation.approveExpenditure),
    expenditureController.approveExpenditure
  );

router
  .route('/:expenditureId/reject')
  .post(
    auth('rejectExpenditure'),
    validate(expenditureValidation.rejectExpenditure),
    expenditureController.rejectExpenditure
  );

module.exports = router;
