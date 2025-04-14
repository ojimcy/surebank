const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { ApiError } = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  // Set the role to 'appUser' for self-registered users
  req.body.role = 'appUser';

  const user = await userService.createUser(req.body);

  // Generate verification token and send verification email
  const verifyEmailOTP = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailOTP);

  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.CREATED).send({
    user,
    tokens,
    message: 'Registration successful. Please check your email to verify your account.',
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password, otp } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password, otp);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const loginUser = catchAsync(async (req, res) => {
  const { identifier, password, otp } = req.body;
  const user = await authService.loginUser(identifier, password, otp);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { otp, user } = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(user.email, otp);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.otp, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyEmailOTP = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailOTP);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body.otp);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  loginUser,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
