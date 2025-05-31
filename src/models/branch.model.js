const branchSchema = require('./branch.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Branch
 */
const Branch = async () => {
  if (!model) {
    const conn = await getConnection();

    // Check if Branch model already exists on the connection to prevent OverwriteModelError
    try {
      model = conn.models.Branch || conn.model('Branch', branchSchema);
    } catch (error) {
      // If model already exists, get it from the connection
      if (error.message.includes('Cannot overwrite')) {
        model = conn.models.Branch;
      } else {
        throw error;
      }
    }
  }

  return model;
};

module.exports = Branch;
