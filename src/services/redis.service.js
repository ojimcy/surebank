const logger = require('../config/logger');

/**
 * In-Memory Token and Session Management Service
 * Replaces Redis with pure JavaScript Maps and automatic cleanup
 */
class InMemoryTokenService {
  constructor() {
    // Token blacklist: Map<token, expiryTimestamp>
    this.tokenBlacklist = new Map();

    // User token blacklist: Map<userId, expiryTimestamp>
    this.userBlacklist = new Map();

    // Sessions: Map<sessionKey, { data, expiryTimestamp }>
    this.sessions = new Map();

    // Clean up expired entries every 5 minutes
    this.startCleanupInterval();

    logger.info('In-memory token service initialized (Redis-free mode)');
  }

  /**
   * Start automatic cleanup of expired entries
   */
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired entries from all maps
   */
  cleanupExpiredEntries() {
    const now = Date.now();
    let cleaned = 0;

    // Clean expired tokens
    for (const [token, expiry] of this.tokenBlacklist.entries()) {
      if (now >= expiry) {
        this.tokenBlacklist.delete(token);
        cleaned++;
      }
    }

    // Clean expired user blacklists
    for (const [userId, expiry] of this.userBlacklist.entries()) {
      if (now >= expiry) {
        this.userBlacklist.delete(userId);
        cleaned++;
      }
    }

    // Clean expired sessions
    for (const [sessionKey, sessionData] of this.sessions.entries()) {
      if (now >= sessionData.expiryTimestamp) {
        this.sessions.delete(sessionKey);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired entries from in-memory storage`);
    }
  }

  /**
   * Mock connect method for compatibility
   */
  async connect() {
    // No-op - already initialized
    logger.info('In-memory token service ready (no external connection needed)');
    return true;
  }

  /**
   * Mock disconnect method for compatibility
   */
  async disconnect() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    logger.info('In-memory token service cleanup interval stopped');
  }

  /**
   * Blacklist a token with expiration
   * @param {string} token - JWT token to blacklist
   * @param {number} expirationSeconds - Seconds until expiry
   * @returns {Promise<boolean>}
   */
  async blacklistToken(token, expirationSeconds) {
    try {
      const expiryTimestamp = Date.now() + (expirationSeconds * 1000);
      this.tokenBlacklist.set(token, expiryTimestamp);
      logger.debug(`Token blacklisted in memory, expires in ${expirationSeconds} seconds`);
      return true;
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {Promise<boolean>}
   */
  async isTokenBlacklisted(token) {
    try {
      const expiry = this.tokenBlacklist.get(token);

      if (!expiry) {
        return false;
      }

      const now = Date.now();
      if (now >= expiry) {
        // Token blacklist has expired, remove it
        this.tokenBlacklist.delete(token);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      // Fail open - allow request if there's an error
      return false;
    }
  }

  /**
   * Blacklist all tokens for a user
   * @param {string} userId - User ID
   * @param {number} expirationSeconds - Seconds until expiry
   * @returns {Promise<boolean>}
   */
  async blacklistUserTokens(userId, expirationSeconds) {
    try {
      const expiryTimestamp = Date.now() + (expirationSeconds * 1000);
      this.userBlacklist.set(userId.toString(), expiryTimestamp);
      logger.debug(`All tokens for user ${userId} blacklisted in memory for ${expirationSeconds} seconds`);
      return true;
    } catch (error) {
      logger.error('Error blacklisting user tokens:', error);
      return false;
    }
  }

  /**
   * Check if all user tokens are blacklisted
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async areUserTokensBlacklisted(userId) {
    try {
      const expiry = this.userBlacklist.get(userId.toString());

      if (!expiry) {
        return false;
      }

      const now = Date.now();
      if (now >= expiry) {
        // User blacklist has expired, remove it
        this.userBlacklist.delete(userId.toString());
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking user token blacklist:', error);
      return false;
    }
  }

  /**
   * Set a user session
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {Object} data - Session data
   * @param {number} expirationSeconds - Seconds until expiry
   * @returns {Promise<boolean>}
   */
  async setUserSession(userId, sessionId, data, expirationSeconds) {
    try {
      const key = `session:${userId}:${sessionId}`;
      const expiryTimestamp = Date.now() + (expirationSeconds * 1000);

      this.sessions.set(key, {
        data: { ...data },
        expiryTimestamp
      });

      logger.debug(`Session created for user ${userId}, expires in ${expirationSeconds} seconds`);
      return true;
    } catch (error) {
      logger.error('Error setting user session:', error);
      return false;
    }
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserSessions(userId) {
    try {
      const pattern = `session:${userId}:`;
      const sessions = [];
      const now = Date.now();

      for (const [key, sessionData] of this.sessions.entries()) {
        if (key.startsWith(pattern)) {
          // Check if session is still valid
          if (now < sessionData.expiryTimestamp) {
            const sessionId = key.split(':').pop();
            sessions.push({
              sessionId,
              data: sessionData.data
            });
          } else {
            // Remove expired session
            this.sessions.delete(key);
          }
        }
      }

      return sessions;
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Delete a specific user session
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>}
   */
  async deleteUserSession(userId, sessionId) {
    try {
      const key = `session:${userId}:${sessionId}`;
      const deleted = this.sessions.delete(key);

      if (deleted) {
        logger.debug(`Session ${sessionId} deleted for user ${userId}`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting user session:', error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async deleteAllUserSessions(userId) {
    try {
      const pattern = `session:${userId}:`;
      let deletedCount = 0;

      for (const key of this.sessions.keys()) {
        if (key.startsWith(pattern)) {
          this.sessions.delete(key);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.debug(`Deleted ${deletedCount} sessions for user ${userId}`);
      }

      return true;
    } catch (error) {
      logger.error('Error deleting all user sessions:', error);
      return false;
    }
  }

  /**
   * Get storage statistics (for monitoring)
   * @returns {Object}
   */
  getStats() {
    return {
      tokenBlacklistSize: this.tokenBlacklist.size,
      userBlacklistSize: this.userBlacklist.size,
      sessionsSize: this.sessions.size,
      totalEntries: this.tokenBlacklist.size + this.userBlacklist.size + this.sessions.size,
      mode: 'in-memory'
    };
  }
}

// Create singleton instance
const redisService = new InMemoryTokenService();

// Handle process termination
process.on('SIGINT', () => {
  redisService.disconnect();
});

process.on('SIGTERM', () => {
  redisService.disconnect();
});

module.exports = redisService;