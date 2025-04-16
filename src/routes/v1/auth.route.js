const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const {
  authLimiter,
  registrationLimiter,
  passwordResetLimiter,
  verificationEmailLimiter,
} = require('../../middlewares/rateLimiter');

const router = express.Router();

// Apply general rate limiting to all auth endpoints
router.use(authLimiter);

// Registration route with stricter rate limiting
router.post('/register', registrationLimiter, validate(authValidation.register), authController.register);

router.post('/login', validate(authValidation.loginUser), authController.loginUser);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

// Apply password reset rate limiter
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

// Apply verification email rate limiter
router.post(
  '/send-verification-email',
  verificationEmailLimiter,
  validate(authValidation.sendVerificationEmail),
  authController.sendVerificationEmail
);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

module.exports = router;
