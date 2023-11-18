const { getConnection } = require('./connection');
const userRoleSchema = require('./userRole.schema');

let model = null;

/**
 * @returns UserRoles
 */
const UserRoles = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('UserRoles', userRoleSchema);
  }

  return model;
};

module.exports = UserRoles;
