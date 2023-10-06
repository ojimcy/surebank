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
  'getTotalWithdrawals',
];

const vendorPermissions = [...userPermissions, 'manageProduct'];

const userRepsPermissions = [
  ...vendorPermissions,
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
  'manageExpenditure',
  'getReports',
  'manageMerchantAdmin',
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
  'getAllStaff',
  'rejectExpenditure',
  'approveExpenditure',
  'makeDeposit',
  'makeWithdrawal',
  'rejectWithdrawalRequests',
  'manageProductRequest',
  'updateUser',
  'deleteUser',
  'manageStaff',
];

const adminPermissions = [
  ...managerPermissions,
  'manageBranch',
  'updateBranchStaff',
  'updateBranch',
  'managerManager',
  'manageVendors',
  'managePromotion',
  'manageCollection',
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
  vendor: vendorPermissions,
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
