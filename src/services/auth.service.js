const httpStatus = require('http-status');
const validator = require('validator');
const { authenticator } = require('otplib');
const tokenService = require('./token.service');
const userService = require('./user.service');
const sessionService = require('./session.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const logger = require('../config/logger');
const redisService = require('./redis.service');

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} otp - Optional 2FA OTP
 * @param {Object} sessionData - Session metadata
 * @returns {Promise<Object>} User and session info
 */
const loginUserWithEmailAndPassword = async (email, password, otp, sessionData = {}) => {
  const user = await userService.getUserByEmail(email);
  
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Check if account is locked
  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    throw new ApiError(httpStatus.LOCKED, `Account is locked. Try again in ${lockTime} minutes.`);
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account deactivated, pls contact admin');
  }

  // Check password
  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch) {
    // Increment login attempts on failed password
    await user.incLoginAttempts();
    
    const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
    if (attemptsLeft === 0) {
      throw new ApiError(httpStatus.LOCKED, 'Account locked due to too many failed attempts. Try again in 30 minutes.');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Incorrect email or password. ${attemptsLeft} attempts remaining.`);
    }
  }

  // Reset login attempts on successful password
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  if (user.isTwoFactorAuthEnabled) {
    if (!otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP is required');
    }

    const isValid = authenticator.verify({ token: otp, secret: user.twoFactorAuthSecret });
    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    }
  }

  // Create new session
  const sessionId = await sessionService.createSession(user.id, {
    ...sessionData,
    loginMethod: 'email_password',
    twoFactorUsed: !!user.isTwoFactorAuthEnabled
  });

  return { user, sessionId };
};

/**
 * Login with email or phone number and password
 * @param {string} identifier - Email or phone number
 * @param {string} password
 * @param {string} otp - One-time password for two-factor authentication
 * @param {Object} sessionData - Session metadata
 * @returns {Promise<Object>} User and session info
 */
const loginUser = async (identifier, password, otp, sessionData = {}) => {
  // Check if the identifier is an email or a phone number
  const isEmail = validator.isEmail(identifier);
  const isPhoneNumber = validator.isMobilePhone(identifier, 'any', { strictMode: false });

  if (!isEmail && !isPhoneNumber) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or phone number format');
  }

  let user;
  if (isEmail) {
    // Login with email
    user = await userService.getUserByEmail(identifier);
  } else {
    // Login with phone number
    user = await userService.getUserByPhoneNumber(identifier);
  }

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found. Please check your email or phone number.');
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password. Please try again.');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account deactivated, pls contact admin');
  }

  if (user.isTwoFactorAuthEnabled) {
    if (!otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP is required for two-factor authentication.');
    }

    const isValid = authenticator.verify({ token: otp, secret: user.twoFactorAuthSecret });
    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP. Please enter a valid OTP.');
    }
  }

  // Create new session
  const sessionId = await sessionService.createSession(user.id, {
    ...sessionData,
    loginMethod: isEmail ? 'email_password' : 'phone_password',
    twoFactorUsed: !!user.isTwoFactorAuthEnabled
  });

  return { user, sessionId };
};

/**
 * Logout
 * @param {string} refreshToken
 * @param {string} accessToken - Access token to blacklist
 * @param {string} sessionId - Session ID to terminate
 * @returns {Promise}
 */
const logout = async (refreshToken, accessToken, sessionId) => {
  const TokenModel = await Token();
  const refreshTokenDoc = await TokenModel.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }

  const userId = refreshTokenDoc.user.toString();

  // Initialize Redis connection if needed
  try {
    if (!redisService.isConnected) {
      await redisService.connect();
    }

    // Blacklist the access token for the remaining time until it expires naturally
    if (accessToken) {
      const jwt = require('jsonwebtoken');
      const config = require('../config/config');
      
      try {
        const decoded = jwt.decode(accessToken);
        const now = Math.floor(Date.now() / 1000);
        const remainingTime = decoded.exp - now;
        
        if (remainingTime > 0) {
          await redisService.blacklistToken(accessToken, remainingTime);
          logger.info(`Access token blacklisted for user: ${userId}`);
        }
      } catch (error) {
        logger.warn('Failed to decode access token for blacklisting:', error.message);
      }
    }
  } catch (error) {
    logger.warn('Failed to blacklist token during logout:', error.message);
  }

  // Terminate the session
  if (sessionId) {
    await sessionService.terminateSession(userId, sessionId);
  }

  // Remove refresh token from database
  await refreshTokenDoc.remove();
  
  logger.info(`User logged out: ${userId}`);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @param {string} accessToken - Current access token to blacklist
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken, accessToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize Redis connection if needed
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }

      // Blacklist the old access token
      if (accessToken) {
        const jwt = require('jsonwebtoken');
        try {
          const decoded = jwt.decode(accessToken);
          const now = Math.floor(Date.now() / 1000);
          const remainingTime = decoded.exp - now;
          
          if (remainingTime > 0) {
            await redisService.blacklistToken(accessToken, remainingTime);
          }
        } catch (error) {
          logger.warn('Failed to decode access token for blacklisting during refresh:', error.message);
        }
      }
    } catch (error) {
      logger.warn('Failed to blacklist token during refresh:', error.message);
    }

    // Remove the old refresh token
    await refreshTokenDoc.remove();
    
    // Generate new token pair (refresh token rotation)
    const newTokens = await tokenService.generateAuthTokens(user);
    
    logger.info(`Tokens refreshed for user: ${user.id}`);
    return newTokens;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (otp, newPassword) => {
  try {
    const TokenModel = await Token();
    const resetPasswordTokenDoc = await tokenService.verifyResetPasswordToken(otp);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    
    // The password validation will be handled by the user schema validator
    // Check password history to prevent reuse
    const isPasswordNew = await user.checkPasswordHistory(newPassword);
    if (!isPasswordNew) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot reuse a recent password. Please choose a different password.');
    }

    // Update user's password and record the change time
    await userService.updateUserById(user.id, { 
      password: newPassword, 
      lastPasswordReset: new Date(),
      passwordResetCount: (user.passwordResetCount || 0) + 1 
    });
    
    // Delete all reset password tokens for this user
    await TokenModel.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    
    // Log the password reset for security auditing
    logger.info(`Password reset successful for user: ${user.id}`);
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed. Try again with a new reset code.');
  }
};

/**
 * Verify email
 * @param {string} otp
 * @returns {Promise}
 */
const verifyEmail = async (otp) => {
  try {
    const TokenModel = await Token();
    const verifyEmailTokenDoc = await tokenService.verifyEmailToken(otp);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await TokenModel.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Invalidate all user tokens (emergency logout)
 * @param {string} userId
 * @returns {Promise}
 */
const invalidateAllUserTokens = async (userId) => {
  try {
    const TokenModel = await Token();
    
    // Remove all refresh tokens from database
    await TokenModel.deleteMany({ user: userId, type: tokenTypes.REFRESH });
    
    // Initialize Redis connection if needed
    try {
      if (!redisService.isConnected) {
        await redisService.connect();
      }
      
      // Blacklist all user tokens for the maximum possible token lifetime
      const config = require('../config/config');
      const maxTokenLifetime = Math.max(
        config.jwt.accessExpirationMinutes * 60,
        config.jwt.refreshExpirationDays * 24 * 60 * 60
      );
      
      await redisService.blacklistUserTokens(userId, maxTokenLifetime);
      
      logger.info(`All tokens invalidated for user: ${userId}`);
    } catch (error) {
      logger.warn('Failed to blacklist user tokens in Redis:', error.message);
    }
    
  } catch (error) {
    logger.error('Failed to invalidate user tokens:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to invalidate tokens');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  loginUser,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  invalidateAllUserTokens,
};
