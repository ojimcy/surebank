const { FileUpload } = require('../models');

const uploadFile = async (originalFileName, fileName, filePath) => {
  const FileUploadModel = await FileUpload();
  const fileUpload = new FileUploadModel({
    originalFileName,
    fileName,
    filePath,
  });

  return fileUpload.save();
};

module.exports = {
  uploadFile,
};
