const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Load environment variables from env.json if not already set
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, 'env.json');
if (fs.existsSync(envPath)) {
  const envConfig = require('./env.json');
  Object.keys(envConfig).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = String(envConfig[key]);
    }
  });
  logger.info('Environment variables loaded from env.json');
}

// Initialize application
async function initialize() {
  try {
    logger.info('Starting application...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

// Initialize on startup
initialize().catch((error) => {
  logger.error('Startup failed:', error);
  process.exit(1);
});

module.exports.handler = serverless(app);

// Serverless function for processing scheduled contributions
// This will be called by AWS EventBridge on a schedule
module.exports.processScheduledContributions = async (event, context) => {
  try {
    logger.info('Processing scheduled contributions via Lambda function');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoose.url, config.mongoose.options);
      logger.info('Connected to MongoDB for scheduled processing');
    }
    
    const scheduledContributionService = require('./src/services/scheduledContribution.service');
    
    // Get all due scheduled contributions
    const dueContributions = await scheduledContributionService.getDueScheduledContributions();
    
    if (dueContributions.length === 0) {
      logger.info('No due scheduled contributions found');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No due contributions',
          processed: 0,
        }),
      };
    }

    logger.info(`Found ${dueContributions.length} due scheduled contributions`);
    
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // Process each due contribution
    for (const contribution of dueContributions) {
      try {
        processedCount++;
        logger.info(`Processing scheduled contribution ${contribution._id} for user ${contribution.userId}`, {
          contributionType: contribution.contributionType,
          amount: contribution.amount,
          frequency: contribution.frequency,
          storedCardPopulated: !!contribution.storedCardId && typeof contribution.storedCardId === 'object'
        });
        
        const result = await scheduledContributionService.processScheduledPayment(contribution);
        
        if (result.success) {
          successCount++;
          logger.info(`Successfully processed contribution ${contribution._id}: ${result.message}`);
        } else {
          failedCount++;
          logger.warn(`Failed to process contribution ${contribution._id}: ${result.message}`);
        }
        
        results.push({
          contributionId: contribution._id,
          userId: contribution.userId,
          success: result.success,
          message: result.message,
          error: result.error || null,
          suspended: result.suspended || false,
        });
        
      } catch (error) {
        failedCount++;
        logger.error(`Error processing contribution ${contribution._id}:`, error);
        
        results.push({
          contributionId: contribution._id,
          userId: contribution.userId,
          success: false,
          message: error.message,
          error: 'PROCESSING_ERROR',
          suspended: false,
        });
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalFound: dueContributions.length,
      totalProcessed: processedCount,
      successCount,
      failedCount,
      results,
    };

    logger.info('Completed scheduled contributions processing:', {
      total: dueContributions.length,
      processed: processedCount,
      success: successCount,
      failed: failedCount,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    };
    
  } catch (error) {
    logger.error('Fatal error in scheduled contributions Lambda function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
