const branchStaffSchema = require('./branchStaff.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns BranchStaff
 */
const BranchStaff = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('BranchStaff', branchStaffSchema);
  }

  return model;
};

module.exports = BranchStaff;
