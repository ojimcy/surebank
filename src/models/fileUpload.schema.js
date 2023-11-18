const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
  originalFileName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
});

module.exports = fileUploadSchema;
