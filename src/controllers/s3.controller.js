const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { s3Service } = require('../services');

const generatePresignedUrl = catchAsync(async (req, res) => {
  const { contentType, fileName, documentType } = req.body;
  const userId = req.user._id;

  if (!contentType || !fileName || !documentType) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: 'Missing required body parameters: contentType, fileName, documentType' });
  }

  const result = await s3Service.generateUploadPresignedUrl(userId, fileName, contentType, documentType);
  res.status(httpStatus.OK).json(result);
});

const getFileAccessUrl = catchAsync(async (req, res) => {
  const { key } = req.params;
  const url = s3Service.getFileUrl(key);
  res.status(httpStatus.OK).json({ url });
});

const deleteS3File = catchAsync(async (req, res) => {
  const { key } = req.params;
  await s3Service.deleteFile(key);
  res.status(httpStatus.OK).json({ success: true, message: 'File deleted successfully' });
});

module.exports = {
  generatePresignedUrl,
  getFileAccessUrl,
  deleteS3File,
};
