const userPermissions = [
  'getBranches',
  'addEntry',
  'getEntries',
  'viewBalance',
  'viewRoles',
  'getPermission',
  'updateProfile',
  'request',
  'productRequest',
  'getProducts',
  'manageCart',
  'salesOperations',
  'manageSales',
  'accountTransactions',
  'getUserAccount',
  'userPackage',
];

const userRepsPermissions = [
  ...userPermissions,
  'manageUsers',
  'deleteUser',
  'getUsers',
  'manageBranch',
  'getStaffInBranch',
  'updateBranchStaff',
  'manageAccounts',
  'manageSummary',
  'manageSavings',
  'manageCustomerTransaction',
  'manageRoles',
  'manageCustomer',
  'merchantRequest',
  'managePermission',
  'manageCategory',
  'productCatalogue',
  'manageBrand',
  'manageProductRequest',
  'manageExpenditure',
  'getReports',
  'manageMerchantAdmin',
];

const adminPermissions = [...userRepsPermissions, 'makeDeposit', 'makeWithdrawal'];

const superAdminPermissions = [
  ...adminPermissions,
  'createAdmin',
  'updateBranchManager',
  'updateBranch',
  'addStaffToBranch',
  'assignManager',
  'getAllStaff',
  'getAccountInBranch',
  'getAccountsByStaff',
  'reports',
  'accounting',
];

const allRoles = {
  user: userPermissions,
  superAdmin: superAdminPermissions,
  admin: adminPermissions,
  userReps: userRepsPermissions,
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
