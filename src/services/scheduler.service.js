const queueService = require('../config/queue');
const { QUEUE_NAMES, JOB_NAMES, processJob } = require('../workers/scheduledContribution.worker');
const config = require('../config/config');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

class SchedulerService {
  constructor() {
    this.isInitialized = false;
    this.scheduledJobs = new Map();
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize queue service
      await queueService.initialize();

      // Create the scheduled contributions queue
      queueService.createQueue(QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS);

      // Create the worker for processing scheduled contributions
      queueService.createWorker(
        QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS,
        processJob,
        {
          concurrency: 1, // Process one at a time to avoid conflicts
        }
      );

      this.isInitialized = true;
      logger.info('Scheduler service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scheduler service:', error);
      throw error;
    }
  }

  async startScheduledContributionsProcessor() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Determine the cron pattern based on environment
      // In production: every 5 minutes
      // In development/test: every minute for faster testing
      const cronPattern = config.env === 'production' ? '*/5 * * * *' : '* * * * *';
      
      const jobKey = 'scheduled-contributions-processor';
      
      // Remove existing repeating job if it exists
      try {
        const queue = queueService.getQueue(QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS);
        const repeatableJobs = await queue.getRepeatableJobs();
        
        for (const job of repeatableJobs) {
          if (job.key.includes('process-due-contributions')) {
            await queue.removeRepeatable(job.key, job.opts);
            logger.info(`Removed existing repeating job: ${job.key}`);
          }
        }
      } catch (error) {
        logger.warn('Error removing existing repeating jobs:', error);
      }

      // Add the new repeating job
      const job = await queueService.addRepeatingJob(
        QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS,
        JOB_NAMES.PROCESS_DUE_CONTRIBUTIONS,
        {
          jobId: uuidv4(),
          timestamp: Date.now(),
        },
        cronPattern,
        {
          removeOnComplete: 5,
          removeOnFail: 10,
        }
      );

      this.scheduledJobs.set(jobKey, {
        job,
        cronPattern,
        queueName: QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS,
        jobName: JOB_NAMES.PROCESS_DUE_CONTRIBUTIONS,
      });

      logger.info(`Started scheduled contributions processor with cron pattern: ${cronPattern}`);
      logger.info(`Job scheduled to run ${config.env === 'production' ? 'every 5 minutes' : 'every minute'}`);
      
      return job;
    } catch (error) {
      logger.error('Failed to start scheduled contributions processor:', error);
      throw error;
    }
  }

  async stopScheduledContributionsProcessor() {
    try {
      const jobKey = 'scheduled-contributions-processor';
      const scheduledJob = this.scheduledJobs.get(jobKey);
      
      if (!scheduledJob) {
        logger.warn('No scheduled contributions processor job found to stop');
        return;
      }

      const queue = queueService.getQueue(scheduledJob.queueName);
      const repeatableJobs = await queue.getRepeatableJobs();
      
      for (const job of repeatableJobs) {
        if (job.key.includes('process-due-contributions')) {
          await queue.removeRepeatable(job.key, job.opts);
          logger.info(`Stopped scheduled contributions processor: ${job.key}`);
        }
      }

      this.scheduledJobs.delete(jobKey);
    } catch (error) {
      logger.error('Failed to stop scheduled contributions processor:', error);
      throw error;
    }
  }

  async manuallyTriggerProcessor() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const job = await queueService.addJob(
        QUEUE_NAMES.PROCESS_SCHEDULED_CONTRIBUTIONS,
        JOB_NAMES.PROCESS_DUE_CONTRIBUTIONS,
        {
          jobId: uuidv4(),
          timestamp: Date.now(),
          manual: true,
        }
      );

      logger.info(`Manually triggered scheduled contributions processor with job ID: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Failed to manually trigger processor:', error);
      throw error;
    }
  }

  async restartScheduledContributionsProcessor() {
    try {
      await this.stopScheduledContributionsProcessor();
      await this.startScheduledContributionsProcessor();
      logger.info('Restarted scheduled contributions processor');
    } catch (error) {
      logger.error('Failed to restart scheduled contributions processor:', error);
      throw error;
    }
  }

  async getJobStats() {
    try {
      const stats = new Map();
      
      for (const [jobKey, scheduledJob] of this.scheduledJobs) {
        const queue = queueService.getQueue(scheduledJob.queueName);
        
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed(),
          queue.getDelayed(),
        ]);

        stats.set(jobKey, {
          queueName: scheduledJob.queueName,
          jobName: scheduledJob.jobName,
          cronPattern: scheduledJob.cronPattern,
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          delayed: delayed.length,
        });
      }

      return Object.fromEntries(stats);
    } catch (error) {
      logger.error('Failed to get job stats:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      logger.info('Cleaning up scheduler service...');
      
      // Stop all scheduled jobs
      for (const jobKey of this.scheduledJobs.keys()) {
        if (jobKey === 'scheduled-contributions-processor') {
          await this.stopScheduledContributionsProcessor();
        }
      }

      // Close queue service
      await queueService.closeAll();
      
      this.isInitialized = false;
      logger.info('Scheduler service cleanup completed');
    } catch (error) {
      logger.error('Error during scheduler service cleanup:', error);
      throw error;
    }
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;