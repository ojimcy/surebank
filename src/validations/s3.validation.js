const Joi = require('joi');

const generatePresignedUrl = {
  body: Joi.object().keys({
    contentType: Joi.string().required(),
    fileName: Joi.string().required(),
    documentType: Joi.string().required(),
  }),
};

const getFileAccessUrl = {
  params: Joi.object().keys({
    key: Joi.string().required(),
  }),
};

const deleteS3File = {
  params: Joi.object().keys({
    key: Joi.string().required(),
  }),
};

module.exports = {
  generatePresignedUrl,
  getFileAccessUrl,
  deleteS3File,
};
