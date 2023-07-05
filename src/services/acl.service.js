const { UserRoles, RolePermission } = require('../models');

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
  return { users };
};

/**
 * Get permissions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of the operation
 */
const getPermissionsForUser = async (userId) => {
  try {
    const rolesIds = await getRolesForUser(userId);
    const rolePermissions = await RolePermission.find({ roleId: { $in: rolesIds } });
    return { rolePermissions, error: null };
  } catch (error) {
    return { rolePermissions: [], error: error.message };
  }
};

module.exports = {
  getRolesForUser,
  getUsersInRole,
  getPermissionsForUser,
};
