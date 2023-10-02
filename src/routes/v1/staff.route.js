const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const staffValidation = require('../../validations/staff.validation');
const staffController = require('../../controllers/staff.controller');

const router = express.Router();

router
  .route('/')
  .get(auth('getAllStaff'), validate('getAllStaff'), staffController.getAllStaff)
  .post(auth('updateBranchStaff'), validate(staffValidation.createStaff), staffController.createStaff)
  .patch(auth('updateBranchStaff'), validate(staffValidation.updateBranchStaff), staffController.updateBranchStaff);

router.route('/role').patch(auth('manageStaff'), validate(staffValidation.updateStaffRole), staffController.updateStaffRole);

router
  .route('/:branchId')
  .post(auth('updateBranchStaff'), validate(staffValidation.addStaffToBranch), staffController.addStaffToBranch)
  .get(auth('getStaffInBranch'), validate(staffValidation.getStaffInBranch), staffController.getStaffInBranch);

module.exports = router;
