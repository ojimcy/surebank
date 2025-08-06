const logger = require('../config/logger');

const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  const { path } = req;
  const { method } = req;

  // Log slow queries
  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 5000) {
      // Log requests taking more than 5 seconds
      logger.warn(`Slow request detected: ${method} ${path} took ${duration}ms`, {
        method,
        path,
        duration,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });
    }
  });

  next();
};

module.exports = performanceMonitor;
