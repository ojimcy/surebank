const branchSchema = require('./branch.schema');
const { getConnection, getModel } = require('./connection');
const logger = require('../config/logger');

let model = null;

/**
 * @returns Branch
 */
const Branch = async () => {
  try {
    // First try to get the model using getModel helper which ensures connection exists
    return await getModel('Branch');
  } catch (error) {
    // If model not found, create connection and register it manually
    if (!model) {
      const conn = await getConnection();

      // Check if Branch model already exists on the connection
      if (conn.models.Branch) {
        model = conn.models.Branch;
      } else {
        // If not, register it
        model = conn.model('Branch', branchSchema);
        logger.info('Branch model registered successfully');
      }
    }

    return model;
  }
};

module.exports = Branch;
