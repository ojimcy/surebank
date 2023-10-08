const { FileUpload } = require('../models');

const uploadFile = async (originalFileName, fileName, filePath) => {
  const fileUpload = new FileUpload({
    originalFileName,
    fileName,
    filePath,
  });

  return fileUpload.save();
};

module.exports = {
  uploadFile,
};
