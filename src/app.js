const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const corsMiddleware = require('./middlewares/cors');
const { 
  globalApiLimiter, 
  ipBasedLimiter 
} = require('./middlewares/globalRateLimit');
const { 
  securityHeaders, 
  requestId, 
  removeSensitiveHeaders, 
  apiVersioning 
} = require('./middlewares/security');
const { 
  sanitizeInput, 
  preventInjection, 
  preventParameterPollution, 
  validateRequestSize 
} = require('./middlewares/validation');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');
const redisService = require('./services/redis.service');
const { createCSRFMiddleware } = require('./middlewares/csrf');

const app = express();

// Initialize Redis connection on startup
(async () => {
  try {
    await redisService.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache:', error.message);
  }
})();

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Early security middleware
app.use(removeSensitiveHeaders);
app.use(requestId);
app.use(securityHeaders);
app.use(apiVersioning);

// Rate limiting (applied early)
app.use(ipBasedLimiter);
app.use(globalApiLimiter);

// Request validation and security
app.use(validateRequestSize(2 * 1024 * 1024)); // 2MB limit
app.use(preventParameterPollution(['tags', 'categories'])); // Whitelist arrays
app.use(preventInjection);
app.use(sanitizeInput);

// set security HTTP headers (enhanced)
app.use(helmet({
  contentSecurityPolicy: false, // We handle this in securityHeaders
  crossOriginEmbedderPolicy: false // Allow PayStack integration
}));

// CORS with enhanced security
app.use(corsMiddleware);

// parse json request body
app.use(express.json({ limit: '1mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// sanitize request data (additional layer)
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// CSRF protection for state-changing operations
const csrfProtection = createCSRFMiddleware({
  excludedPaths: [
    '/api/v1/paystack/webhook',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh-tokens',
    '/api/v1/health',
  ]
});

app.use(csrfProtection.generateToken);
app.use(csrfProtection.validateToken);

// limit repeated failed requests to auth endpoints
app.use('/v1/auth', authLimiter);

// v1 api routes
app.use('/v1', routes);

app.use('/public', express.static(`${__dirname}/public`));

// Simple root health check endpoint
app.get('/health', (req, res) => {
  const timestamp = new Date().toISOString();
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  logger.info(`HEALTH_CHECK | ${timestamp} | IP: ${clientIp} | UA: ${userAgent}`);

  res.status(httpStatus.OK).json({
    status: 'ok',
    service: 'surebank',
    version: process.env.npm_package_version || '1.7.0',
    uptime: Math.floor(process.uptime()),
  });
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
