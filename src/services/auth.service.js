const httpStatus = require('http-status');
const validator = require('validator');
const { authenticator } = require('otplib');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const logger = require('../config/logger');

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password, otp) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account deactivated, pls contact admin');
  }

  if (user.isTwoFactorAuthEnabled) {
    if (!otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP is required');
    }

    const isValid = authenticator.verify({ token: otp, secret: user.twoFactorAuthSecret });
    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    }
  }

  return user;
};

/**
 * Login with email or phone number and password
 * @param {string} identifier - Email or phone number
 * @param {string} password
 * @param {string} otp - One-time password for two-factor authentication
 * @returns {Promise<User>}
 */
const loginUser = async (identifier, password, otp) => {
  // Check if the identifier is an email or a phone number
  const isEmail = validator.isEmail(identifier);
  const isPhoneNumber = validator.isMobilePhone(identifier, 'any', { strictMode: false });

  if (!isEmail && !isPhoneNumber) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or phone number format');
  }

  let user;
  if (isEmail) {
    // Login with email
    user = await userService.getUserByEmail(identifier);
  } else {
    // Login with phone number
    user = await userService.getUserByPhoneNumber(identifier);
  }

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found. Please check your email or phone number.');
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password. Please try again.');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account deactivated, pls contact admin');
  }

  if (user.isTwoFactorAuthEnabled) {
    if (!otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP is required for two-factor authentication.');
    }

    const isValid = authenticator.verify({ token: otp, secret: user.twoFactorAuthSecret });
    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP. Please enter a valid OTP.');
    }
  }

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const TokenModel = await Token();
  const refreshTokenDoc = await TokenModel.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (otp, newPassword) => {
  try {
    const TokenModel = await Token();
    const resetPasswordTokenDoc = await tokenService.verifyResetPasswordToken(otp);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 8 characters long');
    }
    
    // Check if password has common patterns
    const commonPatterns = ['password', '12345678', 'qwerty', user.email?.split('@')[0]];
    if (commonPatterns.some(pattern => newPassword.toLowerCase().includes(pattern))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is too common or contains personal information');
    }

    // Update user's password and record the change time
    await userService.updateUserById(user.id, { 
      password: newPassword, 
      lastPasswordReset: new Date(),
      passwordResetCount: (user.passwordResetCount || 0) + 1 
    });
    
    // Delete all reset password tokens for this user
    await TokenModel.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    
    // Log the password reset for security auditing
    logger.info(`Password reset successful for user: ${user.id}`);
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed. Try again with a new reset code.');
  }
};

/**
 * Verify email
 * @param {string} otp
 * @returns {Promise}
 */
const verifyEmail = async (otp) => {
  try {
    const TokenModel = await Token();
    const verifyEmailTokenDoc = await tokenService.verifyEmailToken(otp);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await TokenModel.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  loginUser,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
