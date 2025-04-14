const rateLimit = require('express-rate-limit');

// General auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

// More strict rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 registration attempts per hour
  message: 'Too many registration attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for verification emails
const verificationEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 verification email requests per hour
  message: 'Too many verification email requests, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  registrationLimiter,
  passwordResetLimiter,
  verificationEmailLimiter,
};
