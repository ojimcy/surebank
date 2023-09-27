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
  'createAccount',
  'createDsPackage',
  'getPackage',
  'manageContributions',
  'getCustomerWithdrawals',
  'requestCash',
];

const userRepsPermissions = [
  ...userPermissions,
  'manageUsers',
  'deleteUser',
  'getUsers',
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
  'getAllStaff',
];

const managerPermissions = [
  ...userRepsPermissions,
  'createUserReps',
  'createAccessCode',
  'approveWithdrawals',
  'approveExpensis',
  'addStaffToBranch',
  'getAccountInBranch',
  'getAccountsByStaff',
  'getStaffInBranch',
];

const adminPermissions = [
  ...managerPermissions,
  'makeDeposit',
  'makeWithdrawal',
  'rejectWithdrawalRequests',
  'manageBranch',
  'updateBranchStaff',
  'updateBranch',
];

const superAdminPermissions = [
  ...adminPermissions,
  'createAdmin',
  'updateBranchManager',
  'assignManager',
  'reports',
  'accounting',
];

const allRoles = {
  user: userPermissions,
  userReps: userRepsPermissions,
  admin: adminPermissions,
  manager: managerPermissions,
  superAdmin: superAdminPermissions,
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
