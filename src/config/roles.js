const userPermissions = [];

const adminPermissions = [...userPermissions, 'manageUsers', 'deleteUser', 'getUsers'];

const superAdminPermissions = [...adminPermissions, 'createAdmin'];

const allRoles = {
  user: userPermissions,
  superAdmin: superAdminPermissions,
  admin: adminPermissions,
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
