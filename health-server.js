const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');

// Create a simple express app
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'surebank-api',
    version: '1.7.0',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
  });
});

// Detailed health endpoint
app.get('/v1/health/detailed', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'surebank-api',
    version: '1.7.0',
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    dependencies: {
      memory: {
        usage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      },
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Health check server running at http://localhost:${PORT}`);
  console.log(`Basic health endpoint available at http://localhost:${PORT}/health`);
  console.log(`Detailed health endpoint available at http://localhost:${PORT}/v1/health/detailed`);
});
