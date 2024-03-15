const httpStatus = require('http-status');

// CORS middleware function
const corsMiddleware = (req, res, next) => {
  // Set CORS headers to allow requests from all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Check if the request method is OPTIONS (preflight request)
  if (req.method === 'OPTIONS') {
    // Return 200 OK response for OPTIONS requests
    return res.sendStatus(httpStatus.OK);
  }

  // Pass the request to the next middleware or route handler
  next();
};

module.exports = corsMiddleware;
