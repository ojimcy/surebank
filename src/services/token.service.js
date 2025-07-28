const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate cryptographically secure OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Numeric OTP
 */
const generateSecureOTP = (length = 6) => {
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    // Generate random digit (0-9) using crypto.randomInt
    const digit = crypto.randomInt(0, 10);
    otp += digit.toString();
  }
  
  return otp;
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenModel = await Token();
  const tokenDoc = await tokenModel.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const tokenModel = await Token();
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await tokenModel.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password OTP
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const otp = generateSecureOTP(6); // 6-digit cryptographically secure OTP
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const TokenModel = await Token();

  // Delete any existing reset password tokens
  await TokenModel.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });

  // Save OTP in token collection
  await TokenModel.create({
    token: otp,
    user: user.id,
    type: tokenTypes.RESET_PASSWORD,
    expires,
  });

  return { otp, user };
};

/**
 * Verify reset password OTP
 * @param {string} otp
 * @returns {Promise<Token>}
 */
const verifyResetPasswordToken = async (otp) => {
  const TokenModel = await Token();
  const token = await TokenModel.findOne({
    token: otp,
    type: tokenTypes.RESET_PASSWORD,
    blacklisted: false,
  });

  if (!token || moment().isAfter(token.expires)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired reset password code');
  }

  return token;
};

/**
 * Generate verify email OTP
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const otp = generateSecureOTP(6); // 6-digit cryptographically secure OTP
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const TokenModel = await Token();

  // Save OTP in token collection
  await TokenModel.create({
    token: otp,
    user: user.id,
    type: tokenTypes.VERIFY_EMAIL,
    expires,
  });

  return otp;
};

/**
 * Verify email OTP
 * @param {string} otp
 * @returns {Promise<Token>}
 */
const verifyEmailToken = async (otp) => {
  const TokenModel = await Token();
  const token = await TokenModel.findOne({
    token: otp,
    type: tokenTypes.VERIFY_EMAIL,
    blacklisted: false,
  });

  if (!token || moment().isAfter(token.expires)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  return token;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  verifyResetPasswordToken,
  generateVerifyEmailToken,
  verifyEmailToken,
};
