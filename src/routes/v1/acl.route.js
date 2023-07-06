const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const aclValidation = require('../../validations/acl.validation');
const aclController = require('../../controllers/acl.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageRoles'), validate(aclValidation.createRole), aclController.createRole)
  .get(auth('viewRoles'), validate(aclValidation.getRoles), aclController.getRoles);

router
  .route('/permission')
  .get(auth('getPermission'), validate(aclValidation.getPermissionsForUser), aclController.getPermissionsForUser);

router
  .route('/:userId/')
  .get(auth('viewRoles'), validate(aclValidation.getRolesForUser), aclController.getRolesForUser)
  .delete(auth('manageRoles'), validate(aclValidation.deleteUserFromRole), aclController.deleteUserFromRole);

router
  .route('/:roleId/')
  .delete(auth('manageRoles'), validate(aclValidation.deleteRole), aclController.deleteRole)
  .get(auth('viewRoles'), validate(aclValidation.getRoleById), aclController.getRoleById)
  .patch(auth('manageRoles'), validate(aclValidation.updateRole), aclController.updateRole);

router
  .route('/:roleId/permission')
  .post(auth('manageRoles'), validate(aclValidation.addPermissionToRole), aclController.addPermissionToRole)
  .get(auth('getPermission'), validate(aclValidation.getRolePermissions), aclController.getRolePermissions);

router
  .route('/:roleId/user-role')
  .post(auth('manageRoles'), validate(aclValidation.createUserRole), aclController.createUserRole)
  .get(auth('manageRoles'), validate(aclValidation.getRolePermissions), aclController.getUsersInRole);

module.exports = router;
