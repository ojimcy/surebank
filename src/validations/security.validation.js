const Joi = require('joi');

const enable2fa = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
    twoFaCode: Joi.string().required(),
  }),
};

const disable2fa = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
    twoFaCode: Joi.string().required(),
  }),
};

const sendOtp = {
  body: Joi.object().keys({
    action: Joi.string(),
  }),
};

module.exports = {
  sendOtp,
  enable2fa,
  disable2fa,
};
