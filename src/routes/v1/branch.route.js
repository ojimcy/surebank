const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const branchValidation = require('../../validations/branch.validation');
const branchController = require('../../controllers/branch.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageBranch'), validate(branchValidation.createBranch), branchController.createBranch)
  .get(auth('getBranches'), validate(branchValidation.getBranches), branchController.getBranches);

router
  .route('/change-manager/:branchId')
  .patch(auth('updateBranchManager'), validate(branchValidation.updateBranchManager), branchController.updateBranchManager);

router.route('/:branchId').get(auth('getBranches'), validate(branchValidation.getBranch), branchController.getBranch);

module.exports = router;
