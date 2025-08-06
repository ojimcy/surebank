const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Cache database connection
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    logger.info('Creating new database connection...');
    await mongoose.connect(config.mongoose.url, {
      ...config.mongoose.options,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// Create the serverless handler
const handler = serverless(app);

// Wrap the handler to ensure database connection
module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectToDatabase();
    return await handler(event, context);
  } catch (error) {
    logger.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
