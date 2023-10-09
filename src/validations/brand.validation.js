const Joi = require('joi');

const createBrand = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    logo: Joi.string().optional(),
  }),
};

const deleteBrand = {
  params: Joi.object().keys({
    brandId: Joi.string().required(),
  }),
};

const updateBrand = {
  params: Joi.object().keys({
    brandId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = {
  createBrand,
  deleteBrand,
  updateBrand,
};
