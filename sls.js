const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

logger.info('Starting...');
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
});

module.exports.handler = serverless(app);
