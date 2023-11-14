const mongoose = require('mongoose');
const { getConnection } = require('./connection');

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

let model = null;

/**
 * @returns FileUpload
 */
const FileUpload = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('FileUpload', fileUploadSchema);
  }

  return model;
};

module.exports = FileUpload;
