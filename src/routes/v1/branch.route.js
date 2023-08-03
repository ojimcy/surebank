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
  .route('/staff')
  .post(auth('addStaffToBranch'), validate(branchValidation.addStaffToBranch), branchController.addStaffToBranch)
  .get(auth('getAllStaff'), validate(branchValidation.getAllStaff), branchController.getAllStaff)
  .patch(auth('updateBranchStaff'), validate(branchValidation.updateBranchStaff), branchController.updateBranchStaff)
  .delete(auth('manageBranch'), validate(branchValidation.deleteBranchStaff), branchController.deleteBranchStaff);
router
  .route('/:branchId')
  .get(auth('getBranches'), validate(branchValidation.getBranch), branchController.getBranch)
  .patch(auth('updateBranch'), validate(branchValidation.updateBranch), branchController.updateBranch)
  .delete(auth('manageBranch'), validate(branchValidation.deleteBranch), branchController.deleteBranch);

router
  .route('/:branchId/staff')
  // .post(auth('addStaffToBranch'), validate(branchValidation.addStaffToBranch), branchController.addStaffToBranch)
  .get(auth('getStaffInBranch'), validate(branchValidation.getStaffInBranch), branchController.getStaffInBranch)
  .patch(auth('updateBranchStaff'), validate(branchValidation.updateBranchStaff), branchController.updateBranchStaff)
  .delete(auth('manageBranch'), validate(branchValidation.deleteBranchStaff), branchController.deleteBranchStaff);

router
  .route('/:branchId/deletestaffbranch')
  .delete(auth('manageBranch'), validate(branchValidation.deleteAllBranchStaff), branchController.deleteAllBranchStaff);

router
  .route('/:branchId/change-manager')
  .patch(auth('updateBranchManager'), validate(branchValidation.updateBranchManager), branchController.updateBranchManager);

module.exports = router;
