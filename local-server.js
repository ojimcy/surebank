const mongoose = require('mongoose');
const app = require('./src/app');
const logger = require('./src/config/logger');

// Load environment variables from env.json
const envConfig = require('./env.json');
Object.keys(envConfig).forEach((key) => {
  process.env[key] = envConfig[key];
});

const PORT = process.env.PORT || 3000;

logger.info('Starting local server...');
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info(`Health endpoint available at http://localhost:${PORT}/health`);
      logger.info(`API health endpoint available at http://localhost:${PORT}/v1/health`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  });
