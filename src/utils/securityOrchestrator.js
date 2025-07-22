const { 
  strictApiLimiter, 
  financialOperationsLimiter,
  adminOperationsLimiter,
  dataExportLimiter 
} = require('../middlewares/globalRateLimit');
const { logSecurityAccess } = require('./authHelpers');
const { validateFileUpload, endpointRateLimit } = require('../middlewares/validation');

/**
 * Apply security middleware stack for financial operations
 */
const financialSecurity = [
  logSecurityAccess('financial'),
  financialOperationsLimiter,
  strictApiLimiter
];

/**
 * Apply security middleware stack for admin operations  
 */
const adminSecurity = [
  logSecurityAccess('admin'),
  adminOperationsLimiter,
  strictApiLimiter
];

/**
 * Apply security middleware stack for data exports/reports
 */
const exportSecurity = [
  logSecurityAccess('export'),
  dataExportLimiter,
  strictApiLimiter
];

/**
 * Apply security middleware stack for file uploads
 */
const uploadSecurity = (options = {}) => [
  logSecurityAccess('upload'),
  validateFileUpload(options),
  endpointRateLimit(20, 60 * 60 * 1000) // 20 uploads per hour
];

/**
 * Apply security middleware stack for user data operations
 */
const userDataSecurity = [
  logSecurityAccess('user_data'),
  strictApiLimiter
];

/**
 * Apply security middleware stack for authentication operations
 */
const authSecurity = [
  logSecurityAccess('auth'),
  strictApiLimiter,
  endpointRateLimit(10, 15 * 60 * 1000) // 10 auth attempts per 15 minutes
];

/**
 * Apply security middleware stack for public/anonymous endpoints
 */
const publicSecurity = [
  logSecurityAccess('public'),
  endpointRateLimit(50, 15 * 60 * 1000) // 50 requests per 15 minutes
];

module.exports = {
  financialSecurity,
  adminSecurity,
  exportSecurity,
  uploadSecurity,
  userDataSecurity,
  authSecurity,
  publicSecurity,
};