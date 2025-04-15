const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');

// Skip rate limiting in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

// General auth rate limiter
const authLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 20 requests per windowMs
      skipSuccessfulRequests: true,
      message: { 
        status: httpStatus.TOO_MANY_REQUESTS,
        message: 'Too many authentication attempts, please try again after 15 minutes' 
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use both IP and user agent to prevent simple IP spoofing
        return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
      },
      handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded: ${req.ip} on ${req.path}`);
        res.status(options.statusCode).send(options.message);
      }
    });

// More strict rate limiter for registration
const registrationLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 3 registration attempts per hour
      message: { 
        status: httpStatus.TOO_MANY_REQUESTS,
        message: 'Too many registration attempts, please try again after an hour' 
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use both IP and user agent to prevent simple IP spoofing
        return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
      },
      handler: (req, res, next, options) => {
        logger.warn(`Registration rate limit exceeded: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
      }
    });

// Rate limiter for password reset
const passwordResetLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 password reset attempts per hour
      message: { 
        status: httpStatus.TOO_MANY_REQUESTS,
        message: 'Too many password reset attempts, please try again after an hour' 
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // For password reset, also consider the email being reset
        return `${req.ip}-${req.body.email || 'unknown'}`;
      },
      handler: (req, res, next, options) => {
        logger.warn(`Password reset rate limit exceeded: ${req.ip} for email: ${req.body.email || 'unknown'}`);
        res.status(options.statusCode).send(options.message);
      }
    });

// Rate limiter for verification emails
const verificationEmailLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 verification email requests per hour
      message: { 
        status: httpStatus.TOO_MANY_REQUESTS,
        message: 'Too many verification email requests, please try again after an hour' 
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // For email verification, also consider the email being verified
        return `${req.ip}-${req.body.email || 'unknown'}`;
      },
      handler: (req, res, next, options) => {
        logger.warn(`Email verification rate limit exceeded: ${req.ip} for email: ${req.body.email || 'unknown'}`);
        res.status(options.statusCode).send(options.message);
      }
    });

module.exports = {
  authLimiter,
  registrationLimiter,
  passwordResetLimiter,
  verificationEmailLimiter,
};
