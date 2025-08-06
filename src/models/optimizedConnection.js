const mongoose = require('mongoose');
const config = require('../config/config');

// Cache the database connection and promise
let cachedDb = null;
let connectionPromise = null;

const connectToDatabase = async () => {
  // If we have a cached connection that's ready, use it
  if (cachedDb && cachedDb.readyState === 1) {
    return cachedDb;
  }

  // If a connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create a new connection
  connectionPromise = mongoose.createConnection(config.mongoose.url, {
    ...config.mongoose.options,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000, // Increase socket timeout
    maxPoolSize: 10, // Connection pool size
    minPoolSize: 2,
    maxIdleTimeMS: 10000,
  });

  try {
    cachedDb = await connectionPromise;
    connectionPromise = null; // Clear the promise once connected

    // Set up connection event handlers
    cachedDb.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err);
      cachedDb = null;
    });

    cachedDb.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.log('MongoDB disconnected');
      cachedDb = null;
    });

    return cachedDb;
  } catch (error) {
    connectionPromise = null; // Clear the promise on error
    throw error;
  }
};

module.exports = { connectToDatabase };
