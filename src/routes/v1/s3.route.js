const express = require('express');
const auth = require('../../middlewares/auth'); // Assuming auth middleware path
const s3Controller = require('../../controllers/s3.controller');
const validate = require('../../middlewares/validate');
const s3Validation = require('../../validations/s3.validation');

const router = express.Router();

router.post('/presigned-url', auth('s3'), validate(s3Validation.generatePresignedUrl), s3Controller.generatePresignedUrl);

// Allow S3 keys that contain slashes by using the Express wildcard parameter pattern
router.get('/files/:key(*)', auth('s3'), validate(s3Validation.getFileAccessUrl), s3Controller.getFileAccessUrl);

router.delete('/files/:key(*)', auth('s3'), validate(s3Validation.deleteS3File), s3Controller.deleteS3File);

module.exports = router;
