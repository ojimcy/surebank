// Helper to merge environment variables for serverless
const envJson = require('./env.json');

module.exports = async ({ options, resolveVariable }) => {
  const stage = options.stage || 'dev';
  
  return {
    ...envJson,
    STAGE: stage,
    NODE_ENV: stage === 'prod' ? 'production' : 'development'
  };
};