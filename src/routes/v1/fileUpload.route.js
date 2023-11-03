const express = require('express');
const upload = require('../../config/multer');
const fileUploadContoller = require('../../controllers/fileUpload.controller');

const router = express.Router();

router.route('/').post(upload.single('file'), fileUploadContoller.uploadFile);

module.exports = router;
