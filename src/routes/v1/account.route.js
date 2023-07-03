const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountValidation = require('../../validations/account.validation');
const accountController = require('../../controllers/account.controller');

const router = express.Router();

router.route('/').post(auth('manageAccounts'), validate(accountValidation.createAccount), accountController.createAccount);

router
  .route('/:brnachId/asign-branch')
  .post(auth('manageAccounts'), validate(accountValidation.assignBranch), accountController.assignBranch);

router
  .route('/:managerId/asign-manager')
  .post(auth('assignManager'), validate(accountValidation.assignManager), accountController.assignManager);

module.exports = router;
