const userPermissions = ['getBranches'];

const adminPermissions = [...userPermissions, 'manageUsers', 'deleteUser', 'getUsers', 'manageBranch'];

const superAdminPermissions = [...adminPermissions, 'createAdmin', 'updateBranchManager'];

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
