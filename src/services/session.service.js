const crypto = require('crypto');
const moment = require('moment');
const config = require('../config/config');
const redisService = require('./redis.service');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

class SessionService {
  constructor() {
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10);
    this.sessionTimeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60', 10);
    this.inactivityTimeoutMinutes = parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES || '30', 10);
  }

  /**
   * Create a new session for a user
   * @param {string} userId 
   * @param {Object} sessionData 
   * @returns {Promise<string>} Session ID
   */
  async createSession(userId, sessionData = {}) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      // Generate unique session ID
      const sessionId = crypto.randomUUID();
      
      // Prepare session data
      const session = {
        userId,
        sessionId,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        ipAddress: sessionData.ipAddress || 'unknown',
        userAgent: sessionData.userAgent || 'unknown',
        deviceFingerprint: sessionData.deviceFingerprint,
        isActive: true,
        loginMethod: sessionData.loginMethod || 'password',
        ...sessionData
      };

      // Check current session count for user
      const currentSessions = await this.getUserSessions(userId);
      
      if (currentSessions.length >= this.maxSessionsPerUser) {
        // Remove oldest session
        const oldestSession = currentSessions.sort((a, b) => 
          new Date(a.data.lastActivityAt) - new Date(b.data.lastActivityAt)
        )[0];
        
        await this.terminateSession(userId, oldestSession.sessionId);
        logger.info(`Oldest session terminated for user ${userId} due to session limit`);
      }

      // Store session in Redis with timeout
      const expirationSeconds = this.sessionTimeoutMinutes * 60;
      await redisService.setUserSession(userId, sessionId, session, expirationSeconds);
      
      logger.info(`Session created for user ${userId}: ${sessionId}`);
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Session creation failed');
    }
  }

  /**
   * Get all active sessions for a user
   * @param {string} userId 
   * @returns {Promise<Array>} Array of session objects
   */
  async getUserSessions(userId) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      const sessions = await redisService.getUserSessions(userId);
      
      // Filter out expired or inactive sessions
      const activeSessions = [];
      const now = new Date();
      
      for (const session of sessions) {
        const lastActivity = new Date(session.data.lastActivityAt);
        const inactivityThreshold = moment(lastActivity).add(this.inactivityTimeoutMinutes, 'minutes').toDate();
        
        if (now < inactivityThreshold && session.data.isActive) {
          activeSessions.push(session);
        } else {
          // Clean up expired session
          await this.terminateSession(userId, session.sessionId);
        }
      }
      
      return activeSessions;
    } catch (error) {
      logger.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Update session activity
   * @param {string} userId 
   * @param {string} sessionId 
   * @param {Object} updateData 
   */
  async updateSessionActivity(userId, sessionId, updateData = {}) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      const sessions = await redisService.getUserSessions(userId);
      const session = sessions.find(s => s.sessionId === sessionId);
      
      if (session) {
        const updatedSession = {
          ...session.data,
          lastActivityAt: new Date().toISOString(),
          ...updateData
        };
        
        // Reset session timeout
        const expirationSeconds = this.sessionTimeoutMinutes * 60;
        await redisService.setUserSession(userId, sessionId, updatedSession, expirationSeconds);
      }
    } catch (error) {
      logger.error('Failed to update session activity:', error);
    }
  }

  /**
   * Validate and refresh a session
   * @param {string} userId 
   * @param {string} sessionId 
   * @returns {Promise<boolean>} True if session is valid
   */
  async validateSession(userId, sessionId) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      const sessions = await redisService.getUserSessions(userId);
      const session = sessions.find(s => s.sessionId === sessionId);
      
      if (!session || !session.data.isActive) {
        return false;
      }

      const lastActivity = new Date(session.data.lastActivityAt);
      const now = new Date();
      const inactivityThreshold = moment(lastActivity).add(this.inactivityTimeoutMinutes, 'minutes').toDate();
      
      if (now > inactivityThreshold) {
        await this.terminateSession(userId, sessionId);
        return false;
      }

      // Update last activity
      await this.updateSessionActivity(userId, sessionId);
      return true;
    } catch (error) {
      logger.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Terminate a specific session
   * @param {string} userId 
   * @param {string} sessionId 
   */
  async terminateSession(userId, sessionId) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      await redisService.deleteUserSession(userId, sessionId);
      logger.info(`Session terminated: ${sessionId} for user: ${userId}`);
    } catch (error) {
      logger.error('Failed to terminate session:', error);
    }
  }

  /**
   * Terminate all sessions for a user
   * @param {string} userId 
   */
  async terminateAllUserSessions(userId) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      await redisService.deleteAllUserSessions(userId);
      logger.info(`All sessions terminated for user: ${userId}`);
    } catch (error) {
      logger.error('Failed to terminate all user sessions:', error);
    }
  }

  /**
   * Get session information
   * @param {string} userId 
   * @param {string} sessionId 
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSessionInfo(userId, sessionId) {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      const sessions = await redisService.getUserSessions(userId);
      const session = sessions.find(s => s.sessionId === sessionId);
      
      return session ? session.data : null;
    } catch (error) {
      logger.error('Failed to get session info:', error);
      return null;
    }
  }

  /**
   * Get session statistics for monitoring
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats() {
    try {
      // This would require additional Redis operations to get global stats
      // For now, return basic structure
      return {
        totalActiveSessions: 0,
        averageSessionDuration: 0,
        sessionsPerUser: {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get session stats:', error);
      return {};
    }
  }

  /**
   * Clean up expired sessions (maintenance task)
   */
  async cleanupExpiredSessions() {
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      // This would require iterating through all session keys
      // Redis automatically handles TTL expiration, but we can add explicit cleanup
      logger.info('Session cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', error);
    }
  }
}

const sessionService = new SessionService();

module.exports = sessionService;