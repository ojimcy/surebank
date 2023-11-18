const { getConnection } = require('./connection');
const fileUploadSchema = require('./fileUpload.schema');

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
