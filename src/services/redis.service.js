const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('../config/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      // Redis configuration
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectionName: 'surebank-auth',
      };

      // Add SSL configuration for production
      if (config.env === 'production' && process.env.REDIS_TLS === 'true') {
        redisConfig.tls = {};
      }

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        // Only log critical errors
        if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ETIMEDOUT') && !err.message.includes('ENOTFOUND')) {
          logger.error('Redis error:', err.message);
        }
        this.isConnected = false;
      });

      this.client.on('close', () => {
        if (this.isConnected) {
          logger.warn('Redis disconnected');
        }
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // In development, fall back to in-memory storage
      if (config.env === 'development') {
        logger.warn('Falling back to in-memory token blacklist for development');
        this.client = null;
        return null;
      }
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  async blacklistToken(token, expirationSeconds) {
    try {
      if (!this.client) {
        // Fallback to in-memory storage in development
        if (!this.memoryBlacklist) {
          this.memoryBlacklist = new Map();
        }
        this.memoryBlacklist.set(token, Date.now() + (expirationSeconds * 1000));
        return true;
      }

      const key = `blacklist:${token}`;
      await this.client.setex(key, expirationSeconds, '1');
      return true;
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      throw error;
    }
  }

  async isTokenBlacklisted(token) {
    try {
      if (!this.client) {
        // Fallback to in-memory storage in development
        if (!this.memoryBlacklist) {
          return false;
        }
        const expiry = this.memoryBlacklist.get(token);
        if (expiry && Date.now() < expiry) {
          return true;
        }
        if (expiry && Date.now() >= expiry) {
          this.memoryBlacklist.delete(token);
        }
        return false;
      }

      const key = `blacklist:${token}`;
      const result = await this.client.get(key);
      return result === '1';
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      // If Redis is down, allow the request to proceed (fail open)
      return false;
    }
  }

  async blacklistUserTokens(userId, expirationSeconds) {
    try {
      if (!this.client) {
        // Fallback to in-memory storage in development
        if (!this.memoryUserBlacklist) {
          this.memoryUserBlacklist = new Map();
        }
        this.memoryUserBlacklist.set(userId, Date.now() + (expirationSeconds * 1000));
        return true;
      }

      const key = `user_blacklist:${userId}`;
      await this.client.setex(key, expirationSeconds, '1');
      return true;
    } catch (error) {
      logger.error('Error blacklisting user tokens:', error);
      throw error;
    }
  }

  async areUserTokensBlacklisted(userId) {
    try {
      if (!this.client) {
        // Fallback to in-memory storage in development
        if (!this.memoryUserBlacklist) {
          return false;
        }
        const expiry = this.memoryUserBlacklist.get(userId);
        if (expiry && Date.now() < expiry) {
          return true;
        }
        if (expiry && Date.now() >= expiry) {
          this.memoryUserBlacklist.delete(userId);
        }
        return false;
      }

      const key = `user_blacklist:${userId}`;
      const result = await this.client.get(key);
      return result === '1';
    } catch (error) {
      logger.error('Error checking user token blacklist:', error);
      return false;
    }
  }

  // Session management methods
  async setUserSession(userId, sessionId, data, expirationSeconds) {
    try {
      if (!this.client) {
        return false;
      }

      const key = `session:${userId}:${sessionId}`;
      await this.client.setex(key, expirationSeconds, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error('Error setting user session:', error);
      return false;
    }
  }

  async getUserSessions(userId) {
    try {
      if (!this.client) {
        return [];
      }

      const pattern = `session:${userId}:*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return [];
      }

      const sessions = await this.client.mget(keys);
      return sessions.map((session, index) => ({
        sessionId: keys[index].split(':').pop(),
        data: JSON.parse(session || '{}')
      })).filter(session => session.data && Object.keys(session.data).length > 0);
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return [];
    }
  }

  async deleteUserSession(userId, sessionId) {
    try {
      if (!this.client) {
        return false;
      }

      const key = `session:${userId}:${sessionId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Error deleting user session:', error);
      return false;
    }
  }

  async deleteAllUserSessions(userId) {
    try {
      if (!this.client) {
        return false;
      }

      const pattern = `session:${userId}:*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      
      return true;
    } catch (error) {
      logger.error('Error deleting all user sessions:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;