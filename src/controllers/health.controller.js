const httpStatus = require('http-status');
const mongoose = require('mongoose');

/**
 * Get basic health status
 * @public
 */
const getHealth = async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'surebank-api',
    version: process.env.npm_package_version || '1.7.0',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
  };

  return res.status(httpStatus.OK).send(healthStatus);
};

/**
 * Get detailed health status including dependencies
 * @public
 */
const getDetailedHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'surebank-api',
    version: process.env.npm_package_version || '1.7.0',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    dependencies: {
      database: {
        status: dbStatus,
        type: 'mongodb',
      },
      memory: {
        usage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
    },
  };

  return res.status(httpStatus.OK).send(healthStatus);
};

module.exports = {
  getHealth,
  getDetailedHealth,
};
