const { PERMISSIONS } = require('../constants/permission');
const { UserRoles, RolePermission, Role, Permission } = require('../models');

/**
 * Create a new role
 * @param {string} label - Role label
 * @param {boolean} merchantRole - Whether the role is a merchant role
 * @returns {Promise<Object>} Result of the operation
 */
const createRole = async (label, merchantRole) => {
  const checkRole = await Role.findOne({ label });
  if (checkRole) {
    throw new Error(`${label} role already exists`);
  } else {
    const role = await Role.create({ label, merchantRole });
    return role;
  }
};

/**
 * Get roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getRoles = async (filter, options) => {
  const roles = await Role.paginate(filter, options);
  return roles;
};

/**
 * Get roles for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of the operation
 */
const getRolesForUser = async (userId) => {
  const userRoles = await UserRoles.find({ userId });
  const roles = userRoles.map((item) => item.roleId);
  return roles;
};

/**
 * Get users in a role
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Result of the operation
 */
const getUsersInRole = async (roleId) => {
  const userRoles = await UserRoles.find({ roleId });
  const users = userRoles.map((item) => item.userId);
  return users;
};

/**
 * Get permissions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of the operation
 */
const getPermissionsForUser = async (userId) => {
  const rolesIds = await getRolesForUser(userId);
  const rolePermissions = await RolePermission.find({ roleId: { $in: rolesIds } });
  return rolePermissions;
};

/**
 * Check if a user has any of the given permissions
 * @param {Array} permissionList - List of permissions
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Result of the operation
 */
const hasAnyOfPermissions = async (permissionList, userId) => {
  const userPermissions = await getPermissionsForUser(userId);
  if (userPermissions.error) return false;
  const permissions = userPermissions.rolePermissions.map((permission) => permission.permissionId);
  if (!permissions || permissions.length === 0) return false;
  for (let i = 0; i < permissionList.length; i += 1) {
    if (permissions.includes(permissionList[i])) return true;
  }
  return false;
};

/**
 * Get permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Result of the operation
 */
const getRolePermissions = async (roleId) => {
  const rolePermissions = await RolePermission.find({ roleId });
  return rolePermissions;
};

const permissions = async () => {
  return PERMISSIONS;
};

/**
 * Create a role permission
 * @param {string} permissionId - Permission ID
 * @param {string} roleId - Role ID
 * @returns {Promise<RolePermission>} Created role permission
 */
const addPermissionToRole = async (permissionId, roleId) => {
  const isAvailable = await RolePermission.findOne({ permissionId, roleId });
  if (isAvailable) {
    throw new Error('Role permission already exists');
  }
  const rolePermission = await RolePermission.create({ permissionId, roleId });
  return rolePermission;
};

/**
 * Create a user role
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<UserRoles>} Created user role
 */
const createUserRole = async (userId, roleId) => {
  const checkRole = await UserRoles.findOne({ userId, roleId });
  if (checkRole) {
    throw new Error('Role already exists for the user');
  }
  const userRoles = await UserRoles.create({ userId, roleId });
  return userRoles;
};

/**
 * Delete a role and related data
 * @param {string} roleId - Role ID
 * @returns {Promise<void>} Empty promise
 */
const deleteRole = async (roleId) => {
  await Role.findByIdAndDelete(roleId);
  await UserRoles.deleteMany({ roleId });
  await RolePermission.deleteMany({ roleId });
};

/**
 * Get a role by ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Role>} Role object
 */
const getRoleById = async (roleId) => {
  const role = await Role.findById(roleId);
  return role;
};

/**
 * Delete a role permission
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<void>} Empty promise
 */
const deleteRolePermission = async (roleId, permissionId) => {
  await RolePermission.findOneAndDelete({ roleId, permissionId });
};

/**
 * Delete a user role
 * @param {string} roleId - Role ID
 * @param {string} userId - User ID
 * @returns {Promise<void>} Empty promise
 */
const deleteUserFromRole = async (roleId, userId) => {
  await UserRoles.findOneAndDelete({ roleId, userId });
};

/**
 * Update a role
 * @param {string} roleId - Role ID
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Updated role
 */
const updateRole = async (roleId, roleData) => {
  const role = await Role.findByIdAndUpdate(roleId, roleData, { new: true });
  return role;
};

/**
 * Create a new permission
 * @param {string} label - Permission label
 * @param {string} description - Permission description
 * @param {boolean} merchantPermission - Whether the permission is a merchant permission
 * @returns {Promise<Object>} Result of the operation
 */
const createPermission = async (label, merchantPermission, description) => {
  const checkPermission = await Permission.findOne({ label });
  if (checkPermission) {
    throw new Error(`${label} Permission already exists`);
  } else {
    const permission = await Permission.create({ label, merchantPermission, description });
    return permission;
  }
};

module.exports = {
  getRolesForUser,
  getUsersInRole,
  getPermissionsForUser,
  hasAnyOfPermissions,
  getRolePermissions,
  createRole,
  getRoles,
  permissions,
  addPermissionToRole,
  createUserRole,
  deleteRole,
  getRoleById,
  deleteRolePermission,
  deleteUserFromRole,
  updateRole,
  createPermission,
};
