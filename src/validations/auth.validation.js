const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().optional().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    branch: Joi.string(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    otp: Joi.string(),
  }),
};

const loginUser = {
  body: Joi.object().keys({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
    otp: Joi.string(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    otp: Joi.string().required().length(6),
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otp: Joi.string().required().length(6),
  }),
};

const sendVerificationEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

module.exports = {
  register,
  login,
  loginUser,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
};
