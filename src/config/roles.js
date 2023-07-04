const userPermissions = ['getBranches', 'addEntry', 'getEntries'];

const adminPermissions = [
  ...userPermissions,
  'manageUsers',
  'deleteUser',
  'getUsers',
  'manageBranch',
  'getStaffInBranch',
  'updateBranchStaff',
  'manageAccounts',
  'manageSummary',
];

const superAdminPermissions = [
  ...adminPermissions,
  'createAdmin',
  'updateBranchManager',
  'addStaffToBranch',
  'assignManager',
];

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
