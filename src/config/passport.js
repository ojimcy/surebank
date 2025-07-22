const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
const redisService = require('../services/redis.service');
const logger = require('./logger');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true, // Pass request to callback for token access
};

const jwtVerify = async (req, payload, done) => {
  try {
    const UserModel = await User();
    
    // Check if token type is valid
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    // Extract token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return done(null, false);
    }

    // Initialize Redis connection if not already connected
    if (!redisService.isConnected) {
      try {
        await redisService.connect();
      } catch (error) {
        logger.warn('Redis not available, proceeding without token blacklist check');
      }
    }

    // Check if token is blacklisted
    try {
      const isBlacklisted = await redisService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        logger.warn(`Blacklisted token attempted access: ${payload.sub}`);
        return done(null, false);
      }

      // Check if all user tokens are blacklisted
      const areUserTokensBlacklisted = await redisService.areUserTokensBlacklisted(payload.sub);
      if (areUserTokensBlacklisted) {
        logger.warn(`User with blacklisted tokens attempted access: ${payload.sub}`);
        return done(null, false);
      }
    } catch (error) {
      logger.warn('Token blacklist check failed, proceeding:', error.message);
    }

    // Get user
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Inactive user attempted access: ${user.id}`);
      return done(null, false);
    }

    // Store token in request for potential future blacklisting
    req.userToken = token;
    
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
