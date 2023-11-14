const catchAsync = require('../utils/catchAsync');

const home = catchAsync(async (req, res) => {
  res.send({ message: 'welcome to home' });
});

module.exports = { home };
