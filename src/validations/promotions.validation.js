const Joi = require('joi');

const promotions = {
  query: Joi.object().keys({
    slug: Joi.string().required(),
    image: Joi.string().required(),
  }),
};

module.exports = {
  promotions,
};
