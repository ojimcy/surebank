const rateLimit = require('express-rate-limit');
const httpStatus = require('http-status');
const logger = require('../config/logger');

// Skip rate limiting in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Global API rate limiter - applies to all endpoints
 */
const globalApiLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: (req) => {
        // Different limits based on authentication status and role
        if (!req.user) {
          return 100; // Anonymous users
        }
        
        const roleLimits = {
          user: 200,
          vendor: 300,
          userReps: 500,
          manager: 1000,
          admin: 2000,
          superAdmin: 5000
        };
        
        return roleLimits[req.user.role] || 100;
      },
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'Rate limit exceeded',
        message: 'Too many requests, please slow down',
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP + User Agent
        if (req.user) {
          return `user:${req.user.id}`;
        }
        return `ip:${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
      },
      handler: (req, res, next, options) => {
        const identifier = req.user ? req.user.id : req.ip;
        logger.warn(`Global rate limit exceeded`, {
          identifier,
          userRole: req.user.role,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        res.status(options.statusCode).json(options.message);
      },
      skip: (req) => {
        // Skip rate limiting for health checks and internal endpoints
        return req.path === '/health' || 
               req.path === '/metrics' || 
               req.path.startsWith('/internal/');
      }
    });

/**
 * Strict rate limiter for sensitive operations
 */
const strictApiLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: (req) => {
        if (!req.user) {
          return 20; // Anonymous users
        }
        
        const roleLimits = {
          user: 50,
          vendor: 75,
          userReps: 100,
          manager: 200,
          admin: 300,
          superAdmin: 500
        };
        
        return roleLimits[req.user.role] || 20;
      },
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'Strict rate limit exceeded',
        message: 'Too many sensitive operations, please wait before trying again',
      },
      keyGenerator: (req) => {
        if (req.user) {
          return `strict:user:${req.user.id}`;
        }
        return `strict:ip:${req.ip}`;
      },
      handler: (req, res, next, options) => {
        const identifier = req.user ? req.user.id : req.ip;
        logger.error(`Strict rate limit exceeded`, {
          identifier,
          userRole: req.user?.role,
          path: req.path,
          method: req.method,
          ip: req.ip,
          severity: 'high'
        });
        res.status(options.statusCode).json(options.message);
      }
    });

/**
 * Financial operations rate limiter - for transactions, transfers, etc.
 */
const financialOperationsLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: (req) => {
        if (!req.user) {
          return 5; // Very limited for anonymous users
        }
        
        const roleLimits = {
          user: 50,      // Regular users - reasonable limit for personal transactions
          vendor: 100,   // Vendors may have more transactions
          userReps: 200, // Staff can help with multiple customer transactions
          manager: 300,  // Managers have higher authority
          admin: 500,    // Admins need flexibility
          superAdmin: 1000 // Super admins for emergency operations
        };
        
        return roleLimits[req.user.role] || 5;
      },
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'Financial operation limit exceeded',
        message: 'Too many financial operations. Please contact support if you need a higher limit.',
      },
      keyGenerator: (req) => {
        if (req.user) {
          return `financial:user:${req.user.id}`;
        }
        return `financial:ip:${req.ip}`;
      },
      handler: (req, res, next, options) => {
        const identifier = req.user ? req.user.id : req.ip;
        logger.error(`Financial operations rate limit exceeded`, {
          identifier,
          userRole: req.user?.role,
          path: req.path,
          method: req.method,
          ip: req.ip,
          severity: 'critical',
          requestBody: req.body // Log request body for financial operations
        });
        res.status(options.statusCode).json(options.message);
      }
    });

/**
 * Admin operations rate limiter
 */
const adminOperationsLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: (req) => {
        if (!req.user || !['admin', 'superAdmin', 'manager'].includes(req.user.role)) {
          return 0; // No admin operations for non-admin users
        }
        
        const roleLimits = {
          manager: 100,
          admin: 200,
          superAdmin: 500
        };
        
        return roleLimits[req.user.role] || 0;
      },
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'Admin operation limit exceeded',
        message: 'Too many administrative operations. Please wait before continuing.',
      },
      keyGenerator: (req) => `admin:user:${req.user?.id || 'unknown'}`,
      handler: (req, res, next, options) => {
        logger.error(`Admin operations rate limit exceeded`, {
          userId: req.user?.id,
          userRole: req.user?.role,
          path: req.path,
          method: req.method,
          ip: req.ip,
          severity: 'high'
        });
        res.status(options.statusCode).json(options.message);
      },
      skip: (req) => {
        // Skip if user is not admin
        return !req.user || !['admin', 'superAdmin', 'manager'].includes(req.user.role);
      }
    });

/**
 * Data export rate limiter - for reports and bulk data operations
 */
const dataExportLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: (req) => {
        if (!req.user) {
          return 0; // No exports for anonymous users
        }
        
        const roleLimits = {
          user: 5,       // Limited personal data exports
          vendor: 10,    // Vendor reports
          userReps: 20,  // Customer service reports
          manager: 50,   // Management reports
          admin: 100,    // Admin reports
          superAdmin: 200 // Unlimited exports for super admin
        };
        
        return roleLimits[req.user.role] || 0;
      },
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'Data export limit exceeded',
        message: 'Too many data export requests. Please wait before requesting more reports.',
      },
      keyGenerator: (req) => `export:user:${req.user?.id || 'unknown'}`,
      handler: (req, res, next, options) => {
        logger.warn(`Data export rate limit exceeded`, {
          userId: req.user?.id,
          userRole: req.user?.role,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        res.status(options.statusCode).json(options.message);
      }
    });

/**
 * IP-based rate limiter for additional protection
 */
const ipBasedLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Per IP address
      message: {
        status: httpStatus.TOO_MANY_REQUESTS,
        error: 'IP rate limit exceeded',
        message: 'Too many requests from this IP address',
      },
      keyGenerator: (req) => req.ip,
      handler: (req, res, next, options) => {
        logger.error(`IP-based rate limit exceeded`, {
          ip: req.ip,
          path: req.path,
          method: req.method,
          userAgent: req.get('User-Agent'),
          severity: 'high'
        });
        res.status(options.statusCode).json(options.message);
      }
    });

module.exports = {
  globalApiLimiter,
  strictApiLimiter,
  financialOperationsLimiter,
  adminOperationsLimiter,
  dataExportLimiter,
  ipBasedLimiter,
};