const branchSchema = require('./branch.schma');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Branch
 */
const Branch = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Branch', branchSchema);
  }

  return model;
};

module.exports = Branch;
