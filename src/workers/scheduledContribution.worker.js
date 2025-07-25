const scheduledContributionService = require('../services/scheduledContribution.service');
const logger = require('../config/logger');

const QUEUE_NAMES = {
  PROCESS_SCHEDULED_CONTRIBUTIONS: 'process-scheduled-contributions',
};

const JOB_NAMES = {
  PROCESS_DUE_CONTRIBUTIONS: 'process-due-contributions',
};

const processScheduledContributions = async (job) => {
  const { jobId, timestamp } = job.data;
  
  try {
    logger.info(`Starting scheduled contributions processing job ${jobId} at ${new Date(timestamp).toISOString()}`);
    
    // Get all due scheduled contributions
    const dueContributions = await scheduledContributionService.getDueScheduledContributions();
    
    if (dueContributions.length === 0) {
      logger.info('No due scheduled contributions found');
      return { processed: 0, message: 'No due contributions' };
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
        logger.info(`Processing scheduled contribution ${contribution._id} for user ${contribution.userId}`);
        
        const result = await scheduledContributionService.processScheduledPayment(contribution._id);
        
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
      jobId,
      timestamp,
      totalFound: dueContributions.length,
      totalProcessed: processedCount,
      successCount,
      failedCount,
      results,
    };

    logger.info(`Completed scheduled contributions processing job ${jobId}:`, {
      total: dueContributions.length,
      processed: processedCount,
      success: successCount,
      failed: failedCount,
    });

    return summary;
    
  } catch (error) {
    logger.error(`Fatal error in scheduled contributions processing job ${jobId}:`, error);
    throw error;
  }
};

// Job processor mapping
const processors = {
  [JOB_NAMES.PROCESS_DUE_CONTRIBUTIONS]: processScheduledContributions,
};

// Main processor function for the worker
const processJob = async (job) => {
  const processor = processors[job.name];
  
  if (!processor) {
    throw new Error(`Unknown job type: ${job.name}`);
  }
  
  return await processor(job);
};

module.exports = {
  QUEUE_NAMES,
  JOB_NAMES,
  processJob,
  processors: {
    processScheduledContributions,
  },
};