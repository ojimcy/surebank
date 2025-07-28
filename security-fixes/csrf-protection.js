/**
 * CSRF Protection Implementation
 * Fix for: Missing CSRF protection on state-changing operations
 */

const crypto = require('crypto');
const config = require('../src/config/config');

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
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
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
  
  // Paths to exclude from CSRF (e.g., webhooks)
  const excludedPaths = options.excludedPaths || [
    '/api/v1/paystack/webhook',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh-tokens',
  ];

  return {
    // Generate and attach CSRF token to response
    generateToken: (req, res, next) => {
      // Skip if no session
      if (!req.session) {
        return next();
      }

      // Generate or retrieve CSRF secret
      if (!req.session.csrfSecret) {
        req.session.csrfSecret = csrf.generateSecret();
      }

      // Generate new token
      const token = csrf.generateToken(req.session.csrfSecret);
      
      // Attach to request for use in views
      req.csrfToken = () => token;
      
      // Set cookie for SPA
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Allow JS to read for AJAX
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: csrf.tokenExpiry,
      });

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

      // Skip if no session (not authenticated)
      if (!req.session || !req.session.csrfSecret) {
        return next();
      }

      // Get token from multiple sources
      const token = req.body._csrf ||
                   req.query._csrf ||
                   req.headers['x-csrf-token'] ||
                   req.headers['x-xsrf-token'];

      // Validate token
      if (!csrf.validateToken(token, req.session.csrfSecret)) {
        const error = new Error('Invalid CSRF token');
        error.statusCode = 403;
        return next(error);
      }

      next();
    },

    // Double Submit Cookie validation (alternative method)
    doubleSubmitCookie: (req, res, next) => {
      // Skip for excluded paths
      if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Skip for non-protected methods
      if (!protectedMethods.includes(req.method)) {
        return next();
      }

      // Get token from header and cookie
      const headerToken = req.headers['x-xsrf-token'];
      const cookieToken = req.cookies['XSRF-TOKEN'];

      // Both must exist and match
      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        const error = new Error('CSRF token validation failed');
        error.statusCode = 403;
        return next(error);
      }

      next();
    },
  };
};

// Helper to add CSRF token to forms (for server-side rendering)
const csrfFormField = (req) => {
  const token = req.csrfToken ? req.csrfToken() : '';
  return `<input type="hidden" name="_csrf" value="${token}" />`;
};

// AJAX setup helper for frontend
const ajaxCSRFSetup = `
// Add CSRF token to all AJAX requests
const token = document.querySelector('meta[name="csrf-token"]')?.content || 
              getCookie('XSRF-TOKEN');

// For Axios
axios.defaults.headers.common['X-CSRF-Token'] = token;

// For Fetch
const secureFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
  });
};

// For jQuery
$.ajaxSetup({
  headers: {
    'X-CSRF-Token': token
  }
});

// Helper to get cookie value
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
`;

module.exports = {
  CSRFProtection,
  createCSRFMiddleware,
  csrfFormField,
  ajaxCSRFSetup,
};

/**
 * Implementation steps:
 * 
 * 1. Add CSRF middleware to app.js after session middleware:
 *    const { createCSRFMiddleware } = require('./security-fixes/csrf-protection');
 *    const csrfProtection = createCSRFMiddleware({
 *      excludedPaths: ['/api/v1/paystack/webhook']
 *    });
 *    app.use(csrfProtection.generateToken);
 *    app.use(csrfProtection.validateToken);
 * 
 * 2. Update frontend to include CSRF token in requests:
 *    - Add meta tag: <meta name="csrf-token" content="<%= csrfToken() %>">
 *    - Or use cookie-based approach with X-XSRF-TOKEN header
 * 
 * 3. For forms, add hidden field:
 *    <input type="hidden" name="_csrf" value="<%= csrfToken() %>">
 * 
 * 4. For AJAX requests, add header:
 *    headers: { 'X-CSRF-Token': token }
 * 
 * 5. Exclude webhooks and public endpoints from CSRF
 * 
 * 6. Consider using SameSite cookies for additional protection
 */