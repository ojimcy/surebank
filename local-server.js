const mongoose = require('mongoose');
const app = require('./src/app');
const logger = require('./src/config/logger');
const schedulerService = require('./src/services/scheduler.service');

// Load environment variables from env.json
const envConfig = require('./env.json');
Object.keys(envConfig).forEach((key) => {
  process.env[key] = envConfig[key];
});

const PORT = process.env.PORT || 3000;

let server;

logger.info('Starting local server...');
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(async () => {
    logger.info('Connected to MongoDB');
    
    // Initialize and start scheduler service
    try {
      await schedulerService.initialize();
      await schedulerService.startScheduledContributionsProcessor();
      logger.info('Scheduled contributions processor started successfully');
    } catch (error) {
      logger.error('Failed to start scheduler service:', error);
      // Continue without scheduler in development
      logger.warn('Continuing without automated scheduler');
    }
    
    server = app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info(`Health endpoint available at http://localhost:${PORT}/health`);
      logger.info(`API health endpoint available at http://localhost:${PORT}/v1/health`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  });

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Stop scheduler service
    await schedulerService.cleanup();
    logger.info('Scheduler service stopped');
  } catch (error) {
    logger.error('Error stopping scheduler service:', error);
  }
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      mongoose.connection.close(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
