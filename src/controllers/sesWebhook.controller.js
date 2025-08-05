const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { sesWebhookService } = require('../services');
const logger = require('../config/logger');

/**
 * Handle SES webhook notifications
 */
const handleSESWebhook = catchAsync(async (req, res) => {
  // Log the webhook call
  logger.info('Received SES webhook notification');
  
  // Process the webhook
  const result = await sesWebhookService.processSESWebhook(req.body);
  
  // SNS expects a 200 OK response
  res.status(httpStatus.OK).json(result);
});

/**
 * Get email statistics
 */
const getEmailStatistics = catchAsync(async (req, res) => {
  const { days } = req.query;
  
  const statistics = await sesWebhookService.getEmailStatistics({
    days: days ? parseInt(days, 10) : 30,
  });
  
  res.status(httpStatus.OK).json({
    status: 'success',
    data: statistics,
  });
});

module.exports = {
  handleSESWebhook,
  getEmailStatistics,
};