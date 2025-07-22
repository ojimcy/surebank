const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights, options = {}) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    
    if (!hasRequiredRights) {
      // Check for self-access permissions
      const allowSelfAccess = options.allowSelfAccess !== false; // Default to true
      const isSelfAccess = req.params.userId === user.id.toString() || 
                          req.params.id === user.id.toString() ||
                          req.body.userId === user.id.toString();
      
      if (!(allowSelfAccess && isSelfAccess)) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Insufficient permissions'));
      }
    }
  }

  // Additional resource-level checks
  if (options.resourceOwnerCheck) {
    try {
      const isAuthorized = await options.resourceOwnerCheck(req, user);
      if (!isAuthorized) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Access denied to this resource'));
      }
    } catch (error) {
      return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Authorization check failed'));
    }
  }

  resolve();
};

const auth = (...args) => {
  // Handle different argument patterns
  const options = typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) 
    ? args.pop() 
    : {};
  
  const requiredRights = args;

  return async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights, options))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };
};

module.exports = auth;
