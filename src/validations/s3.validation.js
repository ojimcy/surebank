const Joi = require('joi');

const generatePresignedUrl = {
  body: Joi.object().keys({
    contentType: Joi.string().required(),
    fileName: Joi.string().required(),
    documentType: Joi.string().required(),
  }),
};

const getFileAccessUrl = {
  // Allow either "key" (from ":key(*)") or index 0 (from wildcard "/*") and tolerate unknown params
  params: Joi.object()
    .keys({
      key: Joi.string(),
      0: Joi.string(),
    })
    .or('key', '0')
    .unknown(true),
};

const deleteS3File = {
  params: Joi.object()
    .keys({
      key: Joi.string(),
      0: Joi.string(),
    })
    .or('key', '0')
    .unknown(true),
};

module.exports = {
  generatePresignedUrl,
  getFileAccessUrl,
  deleteS3File,
};
