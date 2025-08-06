const httpStatus = require('http-status');

// Define allowed origins based on environment
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return [
        'https://surebankstores.ng',
        'https://www.surebankstores.ng'
      ];
    case 'development':
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081'
      ];
    default:
      return ['http://localhost:3000'];
  }
};

// CORS middleware function
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  // Check if the origin is in the allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Check if the request method is OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    // Return 200 OK response for OPTIONS requests
    return res.sendStatus(httpStatus.OK);
  }

  // Pass the request to the next middleware or route handler
  next();
};

module.exports = corsMiddleware;
