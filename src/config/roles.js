const userPermissions = [
  'getBranches',
  'addEntry',
  'getEntries',
  'viewBalance',
  'viewRoles',
  'getPermission',
  'updateProfile',
  'makeDeposit',
  'makeWithdrawal',
  'manageSavings',
  'request',
  'manageMerchantAdmin',
  'productRequest',
  'getProducts',
  'manageCart',
  'salesOperations',
  'manageSales',
  'accountTransactions',
  'getUserAccount',
  'userPackage',
];

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
];

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
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
