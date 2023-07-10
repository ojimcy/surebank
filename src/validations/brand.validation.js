const Joi = require('joi');

const creatBrand = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = {
  creatBrand,
};
