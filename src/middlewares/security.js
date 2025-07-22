const crypto = require('crypto');
const config = require('../config/config');

/**
 * Comprehensive security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Generate nonce for CSP
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  // Content Security Policy
  const cspPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.paystack.co https://checkout.paystack.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "frame-src 'self' https://js.paystack.co",
    "connect-src 'self' https://api.paystack.co",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Security Headers
  res.setHeader('Content-Security-Policy', cspPolicy);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (config.env === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Cache control for sensitive data
  if (req.path.includes('/auth/') || req.path.includes('/user/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Request ID middleware for tracking
 */
const requestId = (req, res, next) => {
  const requestId = crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Remove potentially sensitive headers
 */
const removeSensitiveHeaders = (req, res, next) => {
  // Remove server identification
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

/**
 * API versioning headers
 */
const apiVersioning = (req, res, next) => {
  res.setHeader('API-Version', '1.0');
  res.setHeader('API-Supported-Versions', '1.0');
  next();
};

/**
 * Security monitoring headers
 */
const securityMonitoring = (req, res, next) => {
  // Add security event headers for monitoring
  if (req.user) {
    res.setHeader('X-User-ID', req.user.id);
    res.setHeader('X-User-Role', req.user.role);
  }
  
  // Add request fingerprint
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${req.ip}${req.get('User-Agent') || ''}`)
    .digest('hex')
    .substring(0, 16);
  
  res.setHeader('X-Request-Fingerprint', fingerprint);
  
  next();
};

/**
 * Response time header
 */
const responseTime = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

module.exports = {
  securityHeaders,
  requestId,
  removeSensitiveHeaders,
  apiVersioning,
  securityMonitoring,
  responseTime,
};