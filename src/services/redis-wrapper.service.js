const config = require('../config/config');
const logger = require('../config/logger');

// Import both Redis implementations
const OriginalRedisService = require('./redis.service');
const UpstashRedisService = require('./upstash-redis.service');

class RedisWrapper {
  constructor() {
    // Use Upstash if enabled in config
    const useUpstash = config.upstash?.enabled || (config.env === 'production' && config.upstash?.url);

    if (useUpstash) {
      this.implementation = UpstashRedisService;
    } else {
      this.implementation = OriginalRedisService;
    }
  }

  // Proxy all methods to the selected implementation
  async connect() {
    return this.implementation.connect();
  }

  async disconnect() {
    if (this.implementation.disconnect) {
      return this.implementation.disconnect();
    }
  }

  async blacklistToken(token, expirationSeconds) {
    if (this.implementation.setex) {
      // Upstash implementation
      const key = `blacklist:${token}`;
      return this.implementation.setex(key, expirationSeconds, '1');
    }
    // Original implementation
    return this.implementation.blacklistToken(token, expirationSeconds);
  }

  async isTokenBlacklisted(token) {
    return this.implementation.isTokenBlacklisted(token);
  }

  async blacklistUserTokens(userId, expirationSeconds) {
    if (this.implementation.setex) {
      // Upstash implementation
      const key = `user_blacklist:${userId}`;
      return this.implementation.setex(key, expirationSeconds, '1');
    }
    // Original implementation
    return this.implementation.blacklistUserTokens(userId, expirationSeconds);
  }

  async areUserTokensBlacklisted(userId) {
    if (this.implementation.isUserBlacklisted) {
      // Upstash implementation
      return this.implementation.isUserBlacklisted(userId);
    }
    // Original implementation
    return this.implementation.areUserTokensBlacklisted(userId);
  }

  async setUserSession(userId, sessionId, data, expirationSeconds) {
    if (this.implementation.setex) {
      // Upstash implementation
      const key = `session:${userId}:${sessionId}`;
      return this.implementation.setex(key, expirationSeconds, JSON.stringify(data));
    }
    // Original implementation
    return this.implementation.setUserSession(userId, sessionId, data, expirationSeconds);
  }

  async getUserSessions(userId) {
    if (this.implementation.getUserSessions) {
      return this.implementation.getUserSessions(userId);
    }

    // Upstash implementation - avoid KEYS command
    return [];
  }

  async validateSession(userId, sessionId) {
    if (this.implementation.validateSession) {
      // Upstash optimized method
      return this.implementation.validateSession(userId, sessionId);
    }
    
    // Fallback to basic get
    const key = `session:${userId}:${sessionId}`;
    const data = await this.implementation.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId, sessionId) {
    if (this.implementation.del) {
      // Upstash implementation
      const key = `session:${userId}:${sessionId}`;
      return this.implementation.del(key);
    }
    // Original implementation
    return this.implementation.deleteUserSession(userId, sessionId);
  }

  async deleteAllUserSessions(userId) {
    if (this.implementation.deleteAllUserSessions) {
      return this.implementation.deleteAllUserSessions(userId);
    }

    // For Upstash, session tracking would need separate implementation
    return false;
  }

  // Upstash-specific methods
  getUsageStats() {
    if (this.implementation.getUsageStats) {
      return this.implementation.getUsageStats();
    }
    return null;
  }

  clearMemoryCache() {
    if (this.implementation.clearMemoryCache) {
      return this.implementation.clearMemoryCache();
    }
  }
}

// Export singleton instance
module.exports = new RedisWrapper();