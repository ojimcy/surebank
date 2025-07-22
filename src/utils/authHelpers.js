const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

/**
 * Create resource ownership checker for accounts
 * @param {Object} accountService - Service to fetch account data
 * @returns {Function} Ownership checker function
 */
const createAccountOwnershipChecker = (accountService) => async (req, user) => {
  const accountId = req.params.accountId || req.params.id || req.body.accountId;
  if (!accountId) {
    return false;
  }

  try {
    const account = await accountService.getAccountById(accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }

    // Check if user owns the account or has admin privileges
    const userRoles = ['admin', 'superAdmin', 'manager'];
    const isOwner = account.userId && account.userId.toString() === user.id.toString();
    const hasAdminAccess = userRoles.includes(user.role);

    return isOwner || hasAdminAccess;
  } catch (error) {
    logger.error('Account ownership check failed:', error);
    return false;
  }
};

/**
 * Create resource ownership checker for transactions
 * @param {Object} transactionService - Service to fetch transaction data
 * @returns {Function} Ownership checker function
 */
const createTransactionOwnershipChecker = (transactionService) => async (req, user) => {
  const transactionId = req.params.transactionId || req.params.id || req.body.transactionId;
  if (!transactionId) {
    return false;
  }

  try {
    const transaction = await transactionService.getTransactionById(transactionId);
    if (!transaction) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
    }

    // Check if user is involved in the transaction or has admin privileges
    const userRoles = ['admin', 'superAdmin', 'manager', 'userReps'];
    const isInvolved = (transaction.fromUserId && transaction.fromUserId.toString() === user.id.toString()) ||
                      (transaction.toUserId && transaction.toUserId.toString() === user.id.toString()) ||
                      (transaction.userId && transaction.userId.toString() === user.id.toString());
    const hasAdminAccess = userRoles.includes(user.role);

    return isInvolved || hasAdminAccess;
  } catch (error) {
    logger.error('Transaction ownership check failed:', error);
    return false;
  }
};

/**
 * Create branch-based access checker
 * @param {Object} userService - Service to fetch user data
 * @returns {Function} Branch access checker function
 */
const createBranchAccessChecker = (userService) => async (req, user) => {
  const targetUserId = req.params.userId || req.params.id || req.body.userId;
  if (!targetUserId) {
    return false;
  }

  try {
    const targetUser = await userService.getUserById(targetUserId);
    if (!targetUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Super admin and admin have access to all branches
    if (['superAdmin', 'admin'].includes(user.role)) {
      return true;
    }

    // Managers can access users in their branch
    if (user.role === 'manager') {
      return user.branchId && user.branchId.toString() === targetUser.branchId?.toString();
    }

    // User reps can access users in their branch (limited access)
    if (user.role === 'userReps') {
      return user.branchId && user.branchId.toString() === targetUser.branchId?.toString();
    }

    // Regular users can only access their own data
    return user.id.toString() === targetUser.id.toString();
  } catch (error) {
    logger.error('Branch access check failed:', error);
    return false;
  }
};

/**
 * Check if user has elevated permissions (admin-like roles)
 * @param {Object} user - User object
 * @returns {boolean} True if user has elevated permissions
 */
const hasElevatedPermissions = (user) => {
  const elevatedRoles = ['admin', 'superAdmin', 'manager'];
  return elevatedRoles.includes(user.role);
};

/**
 * Check if user can perform admin actions
 * @param {Object} user - User object
 * @returns {boolean} True if user can perform admin actions
 */
const canPerformAdminActions = (user) => {
  const adminRoles = ['admin', 'superAdmin'];
  return adminRoles.includes(user.role);
};

/**
 * Create a middleware for checking resource ownership
 * @param {Function} ownershipChecker - Function to check ownership
 * @returns {Function} Express middleware
 */
const requireResourceOwnership = (ownershipChecker) => async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  try {
    const hasAccess = await ownershipChecker(req, req.user);
    if (!hasAccess) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Access denied to this resource'));
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user can only access their own data
 */
const requireSelfAccessOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  const targetUserId = req.params.userId || req.params.id || req.body.userId;
  const isSelfAccess = targetUserId === req.user.id.toString();
  
  // Allow admin roles to access any user data
  if (hasElevatedPermissions(req.user)) {
    return next();
  }

  if (!isSelfAccess) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'You can only access your own data'));
  }

  next();
};

/**
 * Middleware to log access attempts for security monitoring
 */
const logSecurityAccess = (resourceType) => (req, res, next) => {
  const user = req.user;
  const resource = req.params.id || req.params.userId || 'unknown';
  
  logger.info('Security access log', {
    userId: user?.id,
    userRole: user?.role,
    resourceType,
    resourceId: resource,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next();
};

module.exports = {
  createAccountOwnershipChecker,
  createTransactionOwnershipChecker,
  createBranchAccessChecker,
  hasElevatedPermissions,
  canPerformAdminActions,
  requireResourceOwnership,
  requireSelfAccessOnly,
  logSecurityAccess,
};