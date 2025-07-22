const httpStatus = require('http-status');
const config = require('../config/config');

// CORS middleware function
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = config.cors.allowedOrigins;

  // Check if the origin is in the allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (config.env === 'development' && !origin) {
    // Allow requests without origin in development (e.g., Postman)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (config.env !== 'development' && origin && !allowedOrigins.includes(origin)) {
    // Reject requests from non-allowed origins in production
    return res.status(httpStatus.FORBIDDEN).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Rate-Limit-Remaining');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Check if the request method is OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    // Return 200 OK response for OPTIONS requests
    return res.sendStatus(httpStatus.OK);
  }

  // Pass the request to the next middleware or route handler
  next();
};

module.exports = corsMiddleware;
