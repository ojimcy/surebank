const httpStatus = require('http-status');
const { aclService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createRole = catchAsync(async (req, res) => {
  const { label, merchantRole } = req.body;
  const role = await aclService.createRole(label, merchantRole);
  res.send(role);
});

const getRoles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['label', 'merchantRole']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await aclService.getRoles(filter, options);
  res.send(result);
});

const getRolesForUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await aclService.getRolesForUser(userId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roles not found');
  }
  res.send(result);
});

const addPermissionToRole = catchAsync(async (req, res) => {
  const { permissionId } = req.body;
  const { roleId } = req.params;
  const rolePermission = await aclService.addPermissionToRole(permissionId, roleId);
  res.send(rolePermission);
});

const createUserRole = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { roleId } = req.params;
  const userRole = await aclService.createUserRole(userId, roleId);
  res.send(userRole);
});

const deleteRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  await aclService.deleteRole(roleId);
  res.status(httpStatus.NO_CONTENT).send('Deleted successfully');
});

const getRoleById = catchAsync(async (req, res) => {
  const role = await aclService.getRoleById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  res.send(role);
});

const getPermissionsForUser = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const permissions = await aclService.getPermissionsForUser(userId);
  if (permissions.error) {
    throw new Error(permissions.error);
  }
  res.send(permissions);
});

const deleteRolePermission = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const { permissionId } = req.body;

  await aclService.deleteRolePermission(roleId, permissionId);
  res.status(httpStatus.NO_CONTENT).send('Deleted successfully');
});

const deleteUserFromRole = catchAsync(async (req, res) => {
  const { roleId } = req.body;
  const { userId } = req.params;

  await aclService.deleteUserFromRole(roleId, userId);
  res.status(httpStatus.NO_CONTENT).send('Deleted successfully');
});

const getRolePermissions = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const rolePermissions = await aclService.getRolePermissions(roleId);
  if (!rolePermissions) {
    throw new ApiError(404, 'Role permissions not found');
  }
  res.send(rolePermissions);
});

const updateRole = catchAsync(async (req, res) => {
  const { label, merchantRole } = req.body;
  const { roleId } = req.params;

  const roleData = {
    label,
    merchantRole,
  };
  const role = await aclService.updateRole(roleId, roleData);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  res.send(role);
});

const getUsersInRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const result = await aclService.getUsersInRole(roleId);
  res.send(result);
});

module.exports = {
  getRolesForUser,
  createRole,
  getRoles,
  addPermissionToRole,
  createUserRole,
  deleteRole,
  getRoleById,
  getPermissionsForUser,
  deleteRolePermission,
  deleteUserFromRole,
  getRolePermissions,
  updateRole,
  getUsersInRole,
};
