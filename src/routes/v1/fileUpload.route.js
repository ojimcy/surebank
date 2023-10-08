const express = require('express');
const upload = require('../../config/multer');
const { handleFileUpload } = require('../../controllers/fileUpload.controller');

const router = express.Router();

const auth = require('../../middlewares/auth');

router.route('/').post(auth('uploadFile'), upload.single('fileToUpload'), handleFileUpload);

module.exports = router;
