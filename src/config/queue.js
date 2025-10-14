const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');

class QueueService {
  constructor() {
    this.connection = null;
    this.queues = new Map();
    this.workers = new Map();
  }

  async initialize() {
    try {
      // Create Redis connection for BullMQ
      // Note: maxRetriesPerRequest MUST be null for BullMQ blocking operations
      this.connection = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        enableReadyCheck: true,
        maxRetriesPerRequest: null, // Required by BullMQ for blocking operations
        connectionName: 'surebank-queue',
        ...(config.env === 'production' && config.redis.tls ? { tls: {} } : {}),
      });

      this.connection.on('connect', () => {
        logger.info('BullMQ Redis connection established');
      });

      this.connection.on('error', (err) => {
        logger.error('BullMQ Redis connection error:', err);
      });

      await this.connection.connect();
      logger.info('Queue service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  createQueue(name, options = {}) {
    if (this.queues.has(name)) {
      return this.queues.get(name);
    }

    const queue = new Queue(name, {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 20,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
      ...options,
    });

    this.queues.set(name, queue);
    logger.info(`Created queue: ${name}`);
    return queue;
  }

  createWorker(queueName, processor, options = {}) {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName);
    }

    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: 5,
      ...options,
    });

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed in queue ${queueName}:`, err);
    });

    worker.on('error', (err) => {
      logger.error(`Worker error in queue ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    logger.info(`Created worker for queue: ${queueName}`);
    return worker;
  }

  getQueue(name) {
    return this.queues.get(name);
  }

  async addJob(queueName, jobName, data, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.add(jobName, data, options);
  }

  async addRepeatingJob(queueName, jobName, data, cronExpression, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.add(jobName, data, {
      repeat: { pattern: cronExpression },
      ...options,
    });
  }

  async removeRepeatingJob(queueName, jobKey) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.removeRepeatable(jobKey);
  }

  async closeAll() {
    try {
      // Close all workers
      for (const [name, worker] of this.workers) {
        logger.info(`Closing worker: ${name}`);
        await worker.close();
      }

      // Close all queues
      for (const [name, queue] of this.queues) {
        logger.info(`Closing queue: ${name}`);
        await queue.close();
      }

      // Close Redis connection
      if (this.connection) {
        await this.connection.disconnect();
      }

      logger.info('All queues and workers closed successfully');
    } catch (error) {
      logger.error('Error closing queues and workers:', error);
      throw error;
    }
  }
}

// Create singleton instance
const queueService = new QueueService();

module.exports = queueService;