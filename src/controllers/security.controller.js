const catchAsync = require('../utils/catchAsync');
const serityService = require('../services/security.service');

const init2fa = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { qrCode, secret } = await serityService.init2fa(userId);
  res.send({ qrCode, secret });
});

const enable2fa = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { otp, twoFaCode } = req.body;
  await serityService.enable2fa(userId, otp, twoFaCode);
  res.send({ message: '2FA enabled successfully' });
});

const disable2fa = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { otp, twoFaCode } = req.body;
  await serityService.disable2fa(userId, otp, twoFaCode);
  res.send({ message: '2FA disabled successfully' });
});

const sendOtp = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { action } = req.body;
  await serityService.sendOtp(userId, action);
  res.send({ message: 'OTP sent successfully' });
});

module.exports = {
  init2fa,
  enable2fa,
  disable2fa,
  sendOtp,
};
