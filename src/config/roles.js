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
  'createPackage',
  'getPackage',
  'manageContributions',
  'getCustomerWithdrawals',
  'requestCash',
  'getTotalWithdrawals',
  'stores',
  'makeContribution',
  'orderOperations',
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
  'productCatalogue',
  'manageBrand',
  'manageExpenditure',
  'getReports',
  'manageMerchantAdmin',
  'packageReports',
  'dashboardReports',
  'mergePackages',
  'updatePackage',
  'sbPackages',
  'contributionsReports',
  'packageReports',
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
  'sbWithdrawal',
  'assignAccountManager',
  'deleteAccount',
  'updateBranchStaff',
  'deactivateStaff',
  'charge',
  'sbPackages',
  'manageNote',
];

const adminPermissions = [
  ...managerPermissions,
  'manageBranch',
  'updateBranch',
  'managerManager',
  'manageVendors',
  'managePromotion',
  'manageCollection',
  'manageStore',
  'manageBrand',
  'reports',
  'updateBranchManager',
  'manageOrder',
  'sendSms',
];

const superAdminPermissions = [...adminPermissions, 'createAdmin', 'assignManager', 'accounting', 'updatePackage'];

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
