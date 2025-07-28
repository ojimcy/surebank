/**
 * CSRF Protection Middleware
 * Implements token-based CSRF protection for state-changing operations
 */

const crypto = require('crypto');
const config = require('../config/config');
const logger = require('../config/logger');

// CSRF token generation and validation
class CSRFProtection {
  constructor(options = {}) {
    this.secretLength = options.secretLength || 18;
    this.saltLength = options.saltLength || 8;
    this.tokenExpiry = options.tokenExpiry || 2 * 60 * 60 * 1000; // 2 hours
  }

  // Generate CSRF secret for session
  generateSecret() {
    return crypto.randomBytes(this.secretLength).toString('base64');
  }

  // Generate CSRF token from secret
  generateToken(secret) {
    const salt = crypto.randomBytes(this.saltLength).toString('base64');
    const hash = this.createHash(secret, salt);
    return salt + '.' + hash;
  }

  // Validate CSRF token
  validateToken(token, secret) {
    if (!token || !secret) return false;
    
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    
    const [salt, hash] = parts;
    const expectedHash = this.createHash(secret, salt);
    
    // Constant-time comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(expectedHash)
      );
    } catch (error) {
      return false;
    }
  }

  // Create hash from secret and salt
  createHash(secret, salt) {
    return crypto
      .createHash('sha256')
      .update(salt + '-' + secret)
      .digest('base64')
      .replace(/=/g, '');
  }
}

// CSRF middleware factory
const createCSRFMiddleware = (options = {}) => {
  const csrf = new CSRFProtection(options);
  
  // Methods that should have CSRF protection
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  // Paths to exclude from CSRF (e.g., webhooks, public APIs)
  const excludedPaths = options.excludedPaths || [
    '/api/v1/paystack/webhook',
    '/api/v1/auth/login',
    '/api/v1/auth/register', 
    '/api/v1/auth/refresh-tokens',
    '/api/v1/health',
  ];

  return {
    // Generate and attach CSRF token to response
    generateToken: (req, res, next) => {
      // Skip if excluded path
      if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // For API-only apps, we'll use a simple approach
      // Generate or retrieve CSRF secret from headers/session
      let csrfSecret = req.headers['x-csrf-secret'];
      
      if (!csrfSecret) {
        csrfSecret = csrf.generateSecret();
      }

      // Generate new token
      const token = csrf.generateToken(csrfSecret);
      
      // Attach to request for use in responses
      req.csrfToken = () => token;
      req.csrfSecret = csrfSecret;
      
      // Set headers for client to use
      res.set('X-CSRF-Token', token);
      res.set('X-CSRF-Secret', csrfSecret);

      next();
    },

    // Validate CSRF token on protected routes
    validateToken: (req, res, next) => {
      // Skip validation for excluded paths
      if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Skip for non-protected methods
      if (!protectedMethods.includes(req.method)) {
        return next();
      }

      // Skip for requests without authentication (public endpoints)
      if (!req.headers.authorization) {
        return next();
      }

      // Get token and secret from headers
      const token = req.headers['x-csrf-token'];
      const secret = req.headers['x-csrf-secret'];

      // Validate token
      if (!csrf.validateToken(token, secret)) {
        logger.warn('CSRF token validation failed', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
        });
        
        const error = new Error('Invalid CSRF token');
        error.statusCode = 403;
        return next(error);
      }

      next();
    },

    // Alternative: Double Submit Cookie validation
    doubleSubmitCookie: (req, res, next) => {
      // Skip for excluded paths
      if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Skip for non-protected methods
      if (!protectedMethods.includes(req.method)) {
        return next();
      }

      // Generate CSRF token if not exists
      if (!req.cookies.csrfToken) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('csrfToken', token, {
          httpOnly: false, // Allow JS to read
          secure: config.env === 'production',
          sameSite: 'strict',
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
        });
        req.csrfToken = () => token;
        return next();
      }

      // Validate double submit
      const cookieToken = req.cookies.csrfToken;
      const headerToken = req.headers['x-csrf-token'];

      if (!headerToken || headerToken !== cookieToken) {
        logger.warn('CSRF double submit validation failed', {
          ip: req.ip,
          path: req.path,
          method: req.method,
        });
        
        const error = new Error('CSRF token validation failed');
        error.statusCode = 403;
        return next(error);
      }

      next();
    },
  };
};

// Export the middleware factory
module.exports = {
  CSRFProtection,
  createCSRFMiddleware,
};

/**
 * Usage in app.js:
 * 
 * const { createCSRFMiddleware } = require('./middlewares/csrf');
 * const csrfProtection = createCSRFMiddleware({
 *   excludedPaths: ['/api/v1/paystack/webhook']
 * });
 * 
 * // Add after authentication middleware
 * app.use(csrfProtection.generateToken);
 * app.use(csrfProtection.validateToken);
 * 
 * Frontend usage:
 * 1. Get token from response headers: X-CSRF-Token
 * 2. Include in subsequent requests: X-CSRF-Token header
 * 3. Also include X-CSRF-Secret header for validation
 */