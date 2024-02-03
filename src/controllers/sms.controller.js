const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { smsService } = require('../services');

const sendBulkSms = catchAsync(async (req, res) => {
  const filterOptions = pick(req.query, ['branchId', 'accountType']);
  const { message } = req.body;
  const sms = await smsService.sendBulkSms(filterOptions, message);

  res.status(httpStatus.OK).json(sms);
});

module.exports = {
  sendBulkSms,
};
