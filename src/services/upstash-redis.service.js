const Redis = require('ioredis');
const logger = require('../config/logger');
const config = require('../config/config');

// In-memory cache to reduce Redis commands
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const COMMAND_LIMIT_WARNING = 8000; // Warn at 80% of daily limit

// Command tracking
let dailyCommandCount = 0;
let commandResetTime = Date.now() + 24 * 60 * 60 * 1000;

// Reset command counter daily
setInterval(() => {
  if (Date.now() >= commandResetTime) {
    logger.info(`Daily Redis commands used: ${dailyCommandCount}`);
    dailyCommandCount = 0;
    commandResetTime = Date.now() + 24 * 60 * 60 * 1000;
  }
}, 60 * 60 * 1000); // Check every hour

class OptimizedRedisService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.fallbackMode = false;
  }

  /**
   * Initialize Redis connection with Upstash
   */
  async connect() {
    try {
      // Use Upstash Redis configuration
      let redisConfig;
      
      if (
        config.upstash &&
        config.upstash.enabled &&
        config.upstash.url &&
        config.upstash.token
      ) {
        // Upstash configuration - properly parse URL
        const upstashHost = config.upstash.url
          .replace('https://', '')
          .replace('http://', '')
          .replace(/\/$/, ''); // Remove trailing slash if present

        redisConfig = {
          host: upstashHost,
          port: 6379,
          password: config.upstash.token,
          tls: {},
          family: 4,
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.warn('Upstash Redis connection failed after 3 retries, switching to fallback mode');
              this.fallbackMode = true;
              return null;
            }
            return Math.min(times * 50, 2000);
          }
        };
        logger.info(`Using Upstash Redis: ${upstashHost}`);
      } else {
        // Standard Redis configuration
        redisConfig = {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
          tls: config.redis.tls ? {} : undefined,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error('Redis connection failed, switching to fallback mode');
              this.fallbackMode = true;
              return null;
            }
            return Math.min(times * 50, 2000);
          }
        };
        logger.info('Using standard Redis configuration');
      }

      this.redis = new Redis(redisConfig);

      this.redis.on('connect', () => {
        logger.info('Connected to Redis (Upstash)');
        this.isConnected = true;
        this.fallbackMode = false;
      });

      this.redis.on('error', (err) => {
        // Only log critical errors, not connection retries
        if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ETIMEDOUT')) {
          logger.error('Redis error:', err.message);
        } else {
          logger.debug('Redis connection issue (will retry):', err.message);
        }
        this.isConnected = false;
      });

      // Test connection
      await this.redis.ping();
      
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.fallbackMode = true;
    }
  }

  /**
   * Track command usage
   */
  trackCommand(count = 1) {
    dailyCommandCount += count;
    
    if (dailyCommandCount >= COMMAND_LIMIT_WARNING && dailyCommandCount < COMMAND_LIMIT_WARNING + 10) {
      logger.warn(`Redis command usage high: ${dailyCommandCount} commands used today`);
    }
  }

  /**
   * Get from memory cache first, then Redis
   */
  async get(key) {
    // Check memory cache first
    const cached = memoryCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }

    if (this.fallbackMode) {
      return null;
    }

    try {
      this.trackCommand();
      const value = await this.redis.get(key);
      
      // Cache in memory to reduce future Redis calls
      if (value !== null) {
        memoryCache.set(key, {
          value,
          expiry: Date.now() + MEMORY_CACHE_TTL
        });
      }
      
      return value;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set with memory cache update
   */
  async setex(key, seconds, value) {
    // Update memory cache immediately
    memoryCache.set(key, {
      value,
      expiry: Date.now() + (seconds * 1000)
    });

    if (this.fallbackMode) {
      return 'OK';
    }

    try {
      this.trackCommand();
      return await this.redis.setex(key, seconds, value);
    } catch (error) {
      logger.error('Redis setex error:', error);
      return null;
    }
  }

  /**
   * Delete with memory cache cleanup
   */
  async del(key) {
    memoryCache.delete(key);

    if (this.fallbackMode) {
      return 1;
    }

    try {
      this.trackCommand();
      return await this.redis.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
      return 0;
    }
  }

  /**
   * Batch get operations to reduce commands
   */
  async mget(keys) {
    const results = [];
    const uncachedKeys = [];
    const keyIndexMap = new Map();

    // Check memory cache first
    keys.forEach((key, index) => {
      const cached = memoryCache.get(key);
      if (cached && Date.now() < cached.expiry) {
        results[index] = cached.value;
      } else {
        uncachedKeys.push(key);
        keyIndexMap.set(key, index);
      }
    });

    if (uncachedKeys.length === 0) {
      return results;
    }

    if (this.fallbackMode) {
      uncachedKeys.forEach(key => {
        results[keyIndexMap.get(key)] = null;
      });
      return results;
    }

    try {
      this.trackCommand();
      const values = await this.redis.mget(...uncachedKeys);
      
      values.forEach((value, i) => {
        const key = uncachedKeys[i];
        const index = keyIndexMap.get(key);
        results[index] = value;
        
        // Cache non-null values
        if (value !== null) {
          memoryCache.set(key, {
            value,
            expiry: Date.now() + MEMORY_CACHE_TTL
          });
        }
      });
      
      return results;
    } catch (error) {
      logger.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Check if token is blacklisted with caching
   */
  async isTokenBlacklisted(token) {
    const key = `blacklist:${token}`;
    const result = await this.get(key);
    return result !== null;
  }

  /**
   * Check if user has blacklisted all tokens with caching
   */
  async isUserBlacklisted(userId) {
    const key = `user_blacklist:${userId}`;
    const result = await this.get(key);
    return result !== null;
  }

  /**
   * Optimized session validation with reduced Redis calls
   */
  async validateSession(userId, sessionId) {
    const sessionKey = `session:${userId}:${sessionId}`;
    
    // Check memory cache first
    const cached = memoryCache.get(sessionKey);
    if (cached && Date.now() < cached.expiry) {
      // Update activity timestamp only every 5 minutes
      if (!cached.lastActivityUpdate || Date.now() - cached.lastActivityUpdate > 5 * 60 * 1000) {
        const sessionData = JSON.parse(cached.value);
        sessionData.lastActivity = new Date().toISOString();
        
        // Update in background, don't wait
        this.setex(sessionKey, sessionData.expiresIn || 3600, JSON.stringify(sessionData))
          .catch(err => logger.error('Failed to update session activity:', err));
        
        cached.lastActivityUpdate = Date.now();
      }
      return JSON.parse(cached.value);
    }

    // Fetch from Redis if not in cache
    const sessionData = await this.get(sessionKey);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      
      // Cache with activity tracking
      memoryCache.set(sessionKey, {
        value: sessionData,
        expiry: Date.now() + MEMORY_CACHE_TTL,
        lastActivityUpdate: Date.now()
      });
      
      return parsed;
    }
    
    return null;
  }

  /**
   * Get current command usage stats
   */
  getUsageStats() {
    const timeUntilReset = Math.max(0, commandResetTime - Date.now());
    const hoursUntilReset = Math.floor(timeUntilReset / (60 * 60 * 1000));
    
    return {
      commandsUsedToday: dailyCommandCount,
      commandsRemaining: Math.max(0, 10000 - dailyCommandCount),
      percentageUsed: Math.round((dailyCommandCount / 10000) * 100),
      hoursUntilReset,
      fallbackMode: this.fallbackMode,
      memoryCacheSize: memoryCache.size
    };
  }

  /**
   * Clear memory cache (for testing or manual cleanup)
   */
  clearMemoryCache() {
    memoryCache.clear();
    logger.info('Memory cache cleared');
  }
}

// Export singleton instance
const redisService = new OptimizedRedisService();
module.exports = redisService;