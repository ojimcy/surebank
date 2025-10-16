const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Job priorities
 */
const PRIORITIES = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BULK: 5,
};

/**
 * Job states
 */
const JOB_STATES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
};

/**
 * In-Memory Queue Implementation
 * A Redis-free queue system using JavaScript data structures
 */
class InMemoryQueue extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.options = {
      concurrency: options.concurrency || 1,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 2000,
      stallInterval: options.stallInterval || 30000,
      removeOnComplete: options.removeOnComplete !== false,
      removeOnFail: options.removeOnFail || false,
      ...options,
    };

    // Queue storage
    this.jobs = new Map(); // All jobs indexed by ID
    this.waitingQueue = []; // Priority queue for waiting jobs
    this.activeJobs = new Map(); // Currently processing jobs
    this.completedJobs = new Map(); // Completed jobs
    this.failedJobs = new Map(); // Failed jobs
    this.delayedJobs = new Map(); // Delayed jobs with timestamps
    this.repeatableJobs = new Map(); // Repeatable/cron jobs

    // Worker management
    this.workers = new Map(); // Registered workers
    this.processing = false;
    this.paused = false;

    // Statistics
    this.stats = {
      processed: 0,
      failed: 0,
      completed: 0,
      retries: 0,
    };

    // Start delayed job checker
    this.startDelayedJobChecker();

    // Start job processor
    this.startProcessor();

    logger.info(`In-memory queue "${name}" initialized with concurrency: ${this.options.concurrency}`);
  }

  /**
   * Add a job to the queue
   */
  async add(name, data, options = {}) {
    const jobId = options.jobId || uuidv4();
    const timestamp = Date.now();

    const job = {
      id: jobId,
      name,
      data,
      opts: {
        priority: options.priority || PRIORITIES.NORMAL,
        delay: options.delay || 0,
        attempts: options.attempts || this.options.maxRetries,
        backoff: options.backoff || { type: 'exponential', delay: this.options.retryDelay },
        removeOnComplete: options.removeOnComplete !== undefined ? options.removeOnComplete : this.options.removeOnComplete,
        removeOnFail: options.removeOnFail !== undefined ? options.removeOnFail : this.options.removeOnFail,
        ...options,
      },
      attemptsMade: 0,
      createdAt: timestamp,
      processedAt: null,
      completedAt: null,
      failedAt: null,
      state: JOB_STATES.WAITING,
      error: null,
      result: null,
    };

    // Store job
    this.jobs.set(jobId, job);

    // Handle delayed jobs
    if (job.opts.delay > 0) {
      const executeAt = timestamp + job.opts.delay;
      job.state = JOB_STATES.DELAYED;
      this.delayedJobs.set(jobId, executeAt);
      logger.debug(`Job ${jobId} delayed until ${new Date(executeAt).toISOString()}`);
    } else {
      // Add to waiting queue
      this.addToWaitingQueue(job);
    }

    // Emit event
    this.emit('added', job);

    // Process queue if not paused
    if (!this.paused) {
      this.processNext();
    }

    return job;
  }

  /**
   * Add a repeatable job (cron-like)
   */
  async addRepeatable(name, data, pattern, options = {}) {
    const jobKey = `${name}:${pattern}`;

    // Parse cron pattern (simplified - supports */n format)
    const interval = this.parseCronPattern(pattern);

    if (!interval) {
      throw new Error(`Invalid cron pattern: ${pattern}`);
    }

    const repeatableJob = {
      name,
      data,
      pattern,
      interval,
      options,
      lastRun: null,
      nextRun: Date.now() + interval,
    };

    this.repeatableJobs.set(jobKey, repeatableJob);

    // Schedule first run
    this.scheduleRepeatableJob(jobKey, repeatableJob);

    logger.info(`Added repeatable job "${name}" with pattern: ${pattern}`);
    return { key: jobKey, ...repeatableJob };
  }

  /**
   * Remove a repeatable job
   */
  async removeRepeatable(key) {
    const job = this.repeatableJobs.get(key);
    if (job) {
      if (job.timerId) {
        clearTimeout(job.timerId);
      }
      this.repeatableJobs.delete(key);
      logger.info(`Removed repeatable job: ${key}`);
      return true;
    }
    return false;
  }

  /**
   * Get repeatable jobs
   */
  async getRepeatableJobs() {
    return Array.from(this.repeatableJobs.entries()).map(([key, job]) => ({
      key,
      name: job.name,
      pattern: job.pattern,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      opts: job.options,
    }));
  }

  /**
   * Schedule a repeatable job
   */
  scheduleRepeatableJob(key, repeatableJob) {
    const now = Date.now();
    const delay = Math.max(0, repeatableJob.nextRun - now);

    repeatableJob.timerId = setTimeout(async () => {
      // Add job to queue
      await this.add(repeatableJob.name, {
        ...repeatableJob.data,
        scheduledAt: new Date(),
        pattern: repeatableJob.pattern,
      }, repeatableJob.options);

      // Update last run and next run
      repeatableJob.lastRun = Date.now();
      repeatableJob.nextRun = repeatableJob.lastRun + repeatableJob.interval;

      // Schedule next run
      this.scheduleRepeatableJob(key, repeatableJob);
    }, delay);
  }

  /**
   * Parse simplified cron pattern
   */
  parseCronPattern(pattern) {
    // Support "*/n * * * *" format (every n minutes)
    const match = pattern.match(/^\*\/(\d+) \* \* \* \*$/);
    if (match) {
      return parseInt(match[1]) * 60 * 1000; // Convert minutes to milliseconds
    }

    // Support "* * * * *" format (every minute)
    if (pattern === '* * * * *') {
      return 60 * 1000;
    }

    // Add more pattern support as needed
    return null;
  }

  /**
   * Add job to waiting queue (priority-based)
   */
  addToWaitingQueue(job) {
    // Insert job based on priority (lower number = higher priority)
    const insertIndex = this.waitingQueue.findIndex(j => j.opts.priority > job.opts.priority);
    if (insertIndex === -1) {
      this.waitingQueue.push(job);
    } else {
      this.waitingQueue.splice(insertIndex, 0, job);
    }
    job.state = JOB_STATES.WAITING;
  }

  /**
   * Start the job processor
   */
  startProcessor() {
    if (this.processorInterval) return;

    this.processorInterval = setInterval(() => {
      if (!this.paused && !this.processing) {
        this.processNext();
      }
    }, 100); // Check every 100ms
  }

  /**
   * Process next job in queue
   */
  async processNext() {
    if (this.paused || this.processing) return;
    if (this.activeJobs.size >= this.options.concurrency) return;
    if (this.waitingQueue.length === 0) return;

    this.processing = true;

    try {
      // Get next job from waiting queue
      const job = this.waitingQueue.shift();
      if (!job) {
        this.processing = false;
        return;
      }

      // Move to active
      job.state = JOB_STATES.ACTIVE;
      job.processedAt = Date.now();
      this.activeJobs.set(job.id, job);

      // Emit event
      this.emit('active', job);

      // Process job with worker
      await this.processJob(job);

    } catch (error) {
      logger.error(`Error processing queue ${this.name}:`, error);
    } finally {
      this.processing = false;
      // Process next job if available
      if (this.activeJobs.size < this.options.concurrency && this.waitingQueue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  /**
   * Process a single job
   */
  async processJob(job) {
    logger.debug(`Looking for worker in queue "${this.name}" for job "${job.name}". Available workers: ${Array.from(this.workers.keys()).join(', ') || 'none'}`);

    const worker = this.workers.get('default') || this.workers.get(job.name);

    if (!worker) {
      logger.error(`No worker registered for job ${job.name} in queue ${this.name}. Available workers: ${Array.from(this.workers.keys()).join(', ') || 'none'}`);
      await this.failJob(job, new Error('No worker registered'));
      return;
    }

    try {
      // Execute worker
      const result = await worker(job);

      // Mark as completed
      await this.completeJob(job, result);

    } catch (error) {
      // Handle failure
      await this.failJob(job, error);
    }
  }

  /**
   * Complete a job successfully
   */
  async completeJob(job, result) {
    job.state = JOB_STATES.COMPLETED;
    job.completedAt = Date.now();
    job.result = result;

    // Remove from active
    this.activeJobs.delete(job.id);

    // Add to completed
    this.completedJobs.set(job.id, job);

    // Update stats
    this.stats.completed++;
    this.stats.processed++;

    // Emit event
    this.emit('completed', job);

    // Remove if configured
    if (job.opts.removeOnComplete) {
      setTimeout(() => {
        this.jobs.delete(job.id);
        this.completedJobs.delete(job.id);
      }, 5000); // Keep for 5 seconds for inspection
    }

    logger.debug(`Job ${job.id} completed successfully`);

    // Process next job
    setImmediate(() => this.processNext());
  }

  /**
   * Fail a job
   */
  async failJob(job, error) {
    job.attemptsMade++;
    job.error = error.message || error;

    // Check if should retry
    if (job.attemptsMade < job.opts.attempts) {
      // Calculate backoff delay
      const delay = this.calculateBackoff(job);

      logger.warn(`Job ${job.id} failed attempt ${job.attemptsMade}, retrying in ${delay}ms`);

      // Remove from active
      this.activeJobs.delete(job.id);

      // Add to delayed
      job.state = JOB_STATES.DELAYED;
      const executeAt = Date.now() + delay;
      this.delayedJobs.set(job.id, executeAt);

      // Update stats
      this.stats.retries++;

      // Emit event
      this.emit('retry', job);
    } else {
      // Final failure
      job.state = JOB_STATES.FAILED;
      job.failedAt = Date.now();

      // Remove from active
      this.activeJobs.delete(job.id);

      // Add to failed
      this.failedJobs.set(job.id, job);

      // Update stats
      this.stats.failed++;

      // Emit event
      this.emit('failed', job, error);

      // Remove if configured
      if (job.opts.removeOnFail) {
        setTimeout(() => {
          this.jobs.delete(job.id);
          this.failedJobs.delete(job.id);
        }, 5000); // Keep for 5 seconds for inspection
      }

      logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);
    }

    // Process next job
    setImmediate(() => this.processNext());
  }

  /**
   * Calculate backoff delay
   */
  calculateBackoff(job) {
    const backoff = job.opts.backoff || {};
    const type = backoff.type || 'exponential';
    const baseDelay = backoff.delay || this.options.retryDelay;

    if (type === 'exponential') {
      return baseDelay * Math.pow(2, job.attemptsMade - 1);
    } else if (type === 'linear') {
      return baseDelay * job.attemptsMade;
    } else {
      return baseDelay;
    }
  }

  /**
   * Start delayed job checker
   */
  startDelayedJobChecker() {
    if (this.delayedJobInterval) return;

    this.delayedJobInterval = setInterval(() => {
      const now = Date.now();

      for (const [jobId, executeAt] of this.delayedJobs.entries()) {
        if (now >= executeAt) {
          const job = this.jobs.get(jobId);
          if (job) {
            // Remove from delayed
            this.delayedJobs.delete(jobId);

            // Add to waiting queue
            this.addToWaitingQueue(job);

            // Process if possible
            if (!this.paused) {
              setImmediate(() => this.processNext());
            }
          }
        }
      }
    }, 1000); // Check every second
  }

  /**
   * Register a worker function
   */
  process(name, concurrency, worker) {
    // Handle different argument combinations
    if (typeof name === 'function') {
      worker = name;
      name = 'default';
      concurrency = 1;
    } else if (typeof concurrency === 'function') {
      worker = concurrency;
      concurrency = 1;
    }

    logger.info(`Registering worker for queue "${this.name}": name="${name}", concurrency=${concurrency}, workerType=${typeof worker}`);

    if (typeof worker !== 'function') {
      logger.error(`Invalid worker type for queue "${this.name}": expected function, got ${typeof worker}`);
      return;
    }

    this.workers.set(name, worker);
    this.options.concurrency = concurrency || this.options.concurrency;

    logger.info(`Worker registered for queue "${this.name}" job type "${name}" with concurrency ${this.options.concurrency}. Total workers: ${this.workers.size}`);
  }

  /**
   * Pause the queue
   */
  pause() {
    this.paused = true;
    this.emit('paused');
    logger.info(`Queue "${this.name}" paused`);
  }

  /**
   * Resume the queue
   */
  resume() {
    this.paused = false;
    this.emit('resumed');
    logger.info(`Queue "${this.name}" resumed`);

    // Process pending jobs
    setImmediate(() => this.processNext());
  }

  /**
   * Get queue statistics
   */
  async getJobCounts() {
    return {
      waiting: this.waitingQueue.length,
      active: this.activeJobs.size,
      completed: this.completedJobs.size,
      failed: this.failedJobs.size,
      delayed: this.delayedJobs.size,
      repeatable: this.repeatableJobs.size,
    };
  }

  /**
   * Get jobs by state
   */
  async getJobs(states = ['waiting', 'active', 'completed', 'failed', 'delayed'], start = 0, end = -1) {
    const jobs = [];

    for (const state of states) {
      let jobList = [];

      switch (state) {
        case 'waiting':
          jobList = this.waitingQueue;
          break;
        case 'active':
          jobList = Array.from(this.activeJobs.values());
          break;
        case 'completed':
          jobList = Array.from(this.completedJobs.values());
          break;
        case 'failed':
          jobList = Array.from(this.failedJobs.values());
          break;
        case 'delayed':
          jobList = Array.from(this.delayedJobs.keys()).map(id => this.jobs.get(id)).filter(j => j);
          break;
      }

      jobs.push(...jobList);
    }

    // Apply pagination
    const actualEnd = end === -1 ? jobs.length : Math.min(end + 1, jobs.length);
    return jobs.slice(start, actualEnd);
  }

  /**
   * Get waiting jobs
   */
  async getWaiting(start = 0, end = -1) {
    const actualEnd = end === -1 ? this.waitingQueue.length : Math.min(end + 1, this.waitingQueue.length);
    return this.waitingQueue.slice(start, actualEnd);
  }

  /**
   * Get active jobs
   */
  async getActive(start = 0, end = -1) {
    const jobs = Array.from(this.activeJobs.values());
    const actualEnd = end === -1 ? jobs.length : Math.min(end + 1, jobs.length);
    return jobs.slice(start, actualEnd);
  }

  /**
   * Get completed jobs
   */
  async getCompleted(start = 0, end = -1) {
    const jobs = Array.from(this.completedJobs.values());
    const actualEnd = end === -1 ? jobs.length : Math.min(end + 1, jobs.length);
    return jobs.slice(start, actualEnd);
  }

  /**
   * Get failed jobs
   */
  async getFailed(start = 0, end = -1) {
    const jobs = Array.from(this.failedJobs.values());
    const actualEnd = end === -1 ? jobs.length : Math.min(end + 1, jobs.length);
    return jobs.slice(start, actualEnd);
  }

  /**
   * Get delayed jobs
   */
  async getDelayed(start = 0, end = -1) {
    const jobs = Array.from(this.delayedJobs.keys()).map(id => this.jobs.get(id)).filter(j => j);
    const actualEnd = end === -1 ? jobs.length : Math.min(end + 1, jobs.length);
    return jobs.slice(start, actualEnd);
  }

  /**
   * Clean old jobs
   */
  async clean(grace, limit, type = 'completed') {
    const now = Date.now();
    const cutoff = now - grace;
    let cleaned = 0;

    const jobMap = type === 'completed' ? this.completedJobs : this.failedJobs;

    for (const [id, job] of jobMap.entries()) {
      if (cleaned >= limit) break;

      const timestamp = job.completedAt || job.failedAt;
      if (timestamp && timestamp < cutoff) {
        jobMap.delete(id);
        this.jobs.delete(id);
        cleaned++;
      }
    }

    logger.info(`Cleaned ${cleaned} ${type} jobs from queue "${this.name}"`);
    return cleaned;
  }

  /**
   * Empty the queue
   */
  async empty() {
    this.waitingQueue = [];
    this.activeJobs.clear();
    this.completedJobs.clear();
    this.failedJobs.clear();
    this.delayedJobs.clear();
    this.jobs.clear();

    logger.info(`Queue "${this.name}" emptied`);
  }

  /**
   * Close the queue
   */
  async close() {
    this.pause();

    if (this.processorInterval) {
      clearInterval(this.processorInterval);
      this.processorInterval = null;
    }

    if (this.delayedJobInterval) {
      clearInterval(this.delayedJobInterval);
      this.delayedJobInterval = null;
    }

    // Clear repeatable job timers
    for (const job of this.repeatableJobs.values()) {
      if (job.timerId) {
        clearTimeout(job.timerId);
      }
    }

    this.removeAllListeners();
    logger.info(`Queue "${this.name}" closed`);
  }
}

/**
 * Queue Manager - Singleton for managing all queues
 */
class InMemoryQueueManager {
  constructor() {
    this.queues = new Map();
    logger.info('In-memory queue manager initialized');
  }

  /**
   * Create or get a queue
   */
  createQueue(name, options = {}) {
    if (!this.queues.has(name)) {
      const queue = new InMemoryQueue(name, options);
      this.queues.set(name, queue);
      logger.info(`Created queue: ${name}`);
    }
    return this.queues.get(name);
  }

  /**
   * Get a queue
   */
  getQueue(name) {
    return this.queues.get(name);
  }

  /**
   * Create a worker for a queue
   */
  createWorker(queueName, processor, options = {}) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    queue.process(processor.name || 'default', options.concurrency || 1, processor);
    return queue;
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName, jobName, data, options = {}) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add(jobName, data, options);
  }

  /**
   * Add a repeating job to a queue
   */
  async addRepeatingJob(queueName, jobName, data, pattern, options = {}) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.addRepeatable(jobName, data, pattern, options);
  }

  /**
   * Initialize (compatibility with existing code)
   */
  async initialize() {
    logger.info('In-memory queue system ready (no external connections needed)');
    return true;
  }

  /**
   * Close all queues
   */
  async closeAll() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
    logger.info('All queues closed');
  }

  /**
   * Get statistics for all queues
   */
  async getAllStats() {
    const stats = {};

    for (const [name, queue] of this.queues.entries()) {
      stats[name] = await queue.getJobCounts();
    }

    return stats;
  }
}

// Export singleton instance
const queueManager = new InMemoryQueueManager();

module.exports = queueManager;
module.exports.PRIORITIES = PRIORITIES;
module.exports.JOB_STATES = JOB_STATES;