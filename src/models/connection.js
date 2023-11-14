const mongoose = require('mongoose');
const config = require('../config/config');

let conn = null;

const getConnection = async () => {
  if (conn == null) {
    const options = {
      ...config.mongoose.options,
      ...{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Buffering means mongoose will queue up operations if it gets
        // disconnected from MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        // and tell the MongoDB driver to not wait more than 5 seconds
        // before erroring out if it isn't connected
        serverSelectionTimeoutMS: 5000,
      },
    };
    conn = mongoose.createConnection(config.mongoose.url, options);

    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn;
  }

  return conn;
};

module.exports = { getConnection };
