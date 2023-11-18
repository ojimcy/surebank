const { getConnection } = require('./connection');
const roleSchema = require('./role.schema');

let model = null;

/**
 * @returns Role
 */
const Role = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Role', roleSchema);
  }

  return model;
};

module.exports = Role;
