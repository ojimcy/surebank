const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const Otp = require('../models/otp.model');
const User = require('../models/user.model');
const { emailTemplates, sendEmail } = require('./email.service');

/**
 *
 * @param {string} userId
 * @returns {Promise<string>}
 */
const sendOtp = async (userId, action = 'complete your action') => {
  // delete all otps for this user
  await Otp.deleteMany({ userId });

  // generate new otp
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  const otpDoc = await Otp.create({ userId, otp, expiry });
  const user = await User.findById(userId);
  await sendEmail(
    { to: user.email, subject: 'Defipay OTP', template: emailTemplates.OTP },
    { otp: otpDoc.otp, name: user.name, action }
  );
  return otpDoc.otp;
};

/**
 *
 * @param {string} userId
 * @param {string} otp
 * @returns {Promise<void>}
 * @throws {ApiError}
 */
const validateOtp = async (userId, otp) => {
  const otpDoc = await Otp.findOne({ userId, otp, expiry: { $gt: new Date() } });
  if (!otpDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid OTP');
  }

  if (otpDoc.isUsed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP already used');
  }

  otpDoc.isUsed = true;
  await otpDoc.save();
};

/**
 *
 * @param {string} userId
 * @returns {Promise<{qrCode: string, secret: string}>}
 * @throws {ApiError}
 * @throws {Error}
 *
 * @description This function will initialize 2FA for the user
 */
const init2fa = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isTwoFactorAuthEnabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA already enabled');
  }

  const secret = authenticator.generateSecret();
  await User.updateOne({ _id: userId }, { twoFactorAuthSecret: secret });

  await sendOtp(userId, 'enable 2FA');

  // generate QR code
  const otpAuthUrl = authenticator.keyuri(user.email, 'Defipay', secret);
  const qrCode = await QRCode.toDataURL(otpAuthUrl);
  return { qrCode, secret };
};

/**
 *
 * @param {string} userId
 * @param {string} twoFaCode
 * @returns {Promise<void>}
 * @throws {ApiError}
 * @throws {Error}
 *
 * @description This function will verify the 2FA code
 *
 */
const verify2faCode = async (userId, twoFaCode) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isValid = authenticator.verify({ token: twoFaCode, secret: user.twoFactorAuthSecret });
  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid 2FA code');
  }
};

/**
 *
 * @param {string} userId
 * @param {string} otp
 * @param {string} twoFaCode
 * @returns {Promise<void>}
 * @throws {ApiError}
 * @throws {Error}
 *
 * @description This function will enable 2FA for the user
 *
 *
 */
const enable2fa = async (userId, otp, twoFaCode) => {
  await validateOtp(userId, otp);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isTwoFactorAuthEnabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA already enabled');
  }

  const isValid = authenticator.verify({ token: twoFaCode, secret: user.twoFactorAuthSecret });
  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid 2FA code');
  }

  await User.updateOne({ _id: userId }, { isTwoFactorAuthEnabled: true });
};

/**
 *
 * @param {string} userId
 * @param {string} otp
 * @param {string} twoFaCode
 * @returns {Promise<void>}
 *
 * @description This function will disable 2FA for the user
 *
 */
const disable2fa = async (userId, otp, twoFaCode) => {
  await validateOtp(userId, otp);

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isValid = authenticator.verify({ token: twoFaCode, secret: user.twoFactorAuthSecret });
  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid 2FA code');
  }

  if (!user.isTwoFactorAuthEnabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA not enabled');
  }

  await User.updateOne({ _id: userId }, { isTwoFactorAuthEnabled: false });
};

module.exports = {
  sendOtp,
  validateOtp,
  enable2fa,
  init2fa,
  verify2faCode,
  disable2fa,
};
