const { uploadFile } = require('../services/fileUpload.service');
const catchAsync = require('../utils/catchAsync');

const handleFileUpload = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { originalname, filename } = req.file;

  const filePath = `/uploads/${filename}`;

  await uploadFile(originalname, filename, filePath);

  return res.status(200).json({ message: 'File uploaded successfully' });
});

module.exports = {
  handleFileUpload,
};
