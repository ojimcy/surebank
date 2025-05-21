const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const s3Client = new S3Client({
  region: config.aws.region,
});

/**
 * Generate a pre-signed URL for uploading an object to S3
 * @param {string} userId
 * @param {string} fileName
 * @param {string} contentType
 * @param {string} documentType
 * @returns {Promise<{url: string, key: string}>}
 */
const generateUploadPresignedUrl = async (userId, fileName, contentType, documentType) => {
  const key = `${userId}/${documentType}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileName
    .split('.')
    .pop()}`;

  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    ContentType: contentType,
    Metadata: {
      'user-id': userId,
      'document-type': documentType,
      'original-name': encodeURIComponent(fileName),
    },
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // Expires in 5 minutes
    return { url, key };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate upload URL');
  }
};

/**
 * Get the public URL of an S3 object
 * @param {string} key
 * @returns {string}
 */
const getFileUrl = (key) => {
  return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
};

/**
 * Delete an object from S3
 * @param {string} key
 * @returns {Promise<void>}
 */
const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete file from S3');
  }
};

module.exports = {
  generateUploadPresignedUrl,
  getFileUrl,
  deleteFile,
  s3Client,
};
