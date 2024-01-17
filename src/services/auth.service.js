const httpStatus = require('http-status');
const { authenticator } = require('otplib');
const validator = require('validator');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

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
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
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
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
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
