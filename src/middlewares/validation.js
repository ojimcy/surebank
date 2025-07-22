const Joi = require('joi');
const httpStatus = require('http-status');
const validator = require('validator');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Enhanced request validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {Object} options - Validation options
 */
const validate = (schema, options = {}) => (req, res, next) => {
  const validObject = {};
  Object.keys(schema).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req, key)) {
      validObject[key] = req[key];
    }
  });

  const { error, value } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(validObject);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    logger.warn('Validation failed:', {
      error: errorMessage,
      path: req.path,
      method: req.method,
      body: req.body,
      userId: req.user?.id
    });
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

/**
 * Sanitize user input to prevent XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return validator.escape(obj.trim());
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      Object.keys(obj).forEach((key) => {
        sanitized[key] = sanitizeObject(obj[key]);
      });
      return sanitized;
    }
    
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Validate file uploads
 */
const validateFileUpload = (options = {}) => (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles = 5
  } = options;

  const files = req.files ? Object.values(req.files).flat() : [req.file];

  if (files.length > maxFiles) {
    return next(new ApiError(httpStatus.BAD_REQUEST, `Maximum ${maxFiles} files allowed`));
  }

  for (const file of files) {
    if (file.size > maxSize) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `File size must be less than ${maxSize / (1024 * 1024)}MB`));
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `File type ${file.mimetype} not allowed`));
    }

    // Additional security checks
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.php', '.js', '.vbs'];
    const fileExtension = file.originalname.toLowerCase().substr(file.originalname.lastIndexOf('.'));
    
    if (suspiciousExtensions.includes(fileExtension)) {
      logger.warn('Suspicious file upload attempt:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        userId: req.user?.id,
        ip: req.ip
      });
      return next(new ApiError(httpStatus.BAD_REQUEST, 'File type not allowed for security reasons'));
    }
  }

  next();
};

/**
 * Rate limiting for specific endpoints
 */
const endpointRateLimit = (maxRequests, windowMs, skipSuccessfulRequests = true) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = `${req.ip}:${req.user?.id || 'anonymous'}:${req.path}`;
    const now = Date.now();
    
    // Clean up old entries
    const cutoff = now - windowMs;
    for (const [k, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(t => t > cutoff);
      if (filtered.length === 0) {
        requests.delete(k);
      } else {
        requests.set(k, filtered);
      }
    }
    
    // Check current request count
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded for endpoint:', {
        key,
        path: req.path,
        method: req.method,
        count: userRequests.length
      });
      return res.status(httpStatus.TOO_MANY_REQUESTS).json({
        error: 'Too many requests',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds allowed`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    // Skip counting successful requests if configured
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode < 400) {
          // Remove this request from count for successful responses
          const current = requests.get(key) || [];
          current.pop();
          requests.set(key, current);
        }
        return originalSend.call(this, data);
      };
    }
    
    next();
  };
};

/**
 * Validate request size and prevent DoS attacks
 */
const validateRequestSize = (maxSizeBytes = 1024 * 1024) => (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  
  if (contentLength > maxSizeBytes) {
    return next(new ApiError(httpStatus.REQUEST_ENTITY_TOO_LARGE, 'Request payload too large'));
  }
  
  next();
};

/**
 * Prevent parameter pollution attacks
 */
const preventParameterPollution = (whitelist = []) => (req, res, next) => {
  const checkPollution = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (Array.isArray(obj[key]) && !whitelist.includes(key)) {
        obj[key] = obj[key][obj[key].length - 1]; // Keep only the last value
      }
    });
  };

  if (req.query) checkPollution(req.query);
  if (req.body) checkPollution(req.body);

  next();
};

/**
 * Enhanced SQL/NoSQL injection prevention
 * Fixed to allow legitimate sorting parameters like "createdAt:desc"
 * while still blocking actual injection attempts
 */
const preventInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\$where|mapreduce|group)/i, // MongoDB injection
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL injection
    /(\$ne|\$gt|\$lt|\$in|\$nin|\$and|\$or|\$not|\$nor)/i, // MongoDB operators in strings
    /<script|javascript:|onclick|onerror|onload/i, // XSS patterns
    /eval\s*\(|function\s*\(|new\s+function/i // Code injection
  ];

  // Safe patterns that should be excluded from injection checks
  const safePatterns = [
    /^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$/i, // Sort parameters like "createdAt:desc"
    /^[a-zA-Z_][a-zA-Z0-9_]*$/, // Simple field names
    /^(pending|completed|cancelled|active|inactive|verified|unverified)$/i, // Common status values
    /^[0-9]+$/, // Pure numbers
    /^(true|false)$/i, // Boolean values
    /^\d{4}-\d{2}-\d{2}$/, // Date format YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime format
  ];

  const isSafeString = (str) => {
    return safePatterns.some(pattern => pattern.test(str));
  };

  const checkForInjection = (obj, path = '') => {
    if (typeof obj === 'string') {
      // Skip injection check for safe patterns
      if (isSafeString(obj)) {
        return;
      }
      
      // Special handling for sortBy query parameters
      if (path === 'query.sortBy' && /^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$/i.test(obj)) {
        return;
      }
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          logger.warn('Potential injection attempt detected:', {
            pattern: pattern.source,
            value: obj,
            path,
            userId: req.user?.id,
            ip: req.ip
          });
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input detected');
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => checkForInjection(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') && !['$regex', '$options'].includes(key)) {
          logger.warn('Suspicious MongoDB operator in request:', {
            key,
            value: obj[key],
            path: `${path}.${key}`,
            userId: req.user?.id,
            ip: req.ip
          });
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid parameter detected');
        }
        checkForInjection(obj[key], `${path}.${key}`);
      });
    }
  };

  try {
    if (req.body) checkForInjection(req.body, 'body');
    if (req.query) checkForInjection(req.query, 'query');
    if (req.params) checkForInjection(req.params, 'params');
  } catch (error) {
    return next(error);
  }

  next();
};

module.exports = {
  validate,
  sanitizeInput,
  validateFileUpload,
  endpointRateLimit,
  validateRequestSize,
  preventParameterPollution,
  preventInjection,
};