const { getConnection } = require('./connection');
const rolePermissionSchema = require('./rolePermission.schema');

let model = null;

/**
 * @returns RolePermission
 */
const RolePermission = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('RolePermission', rolePermissionSchema);
  }

  return model;
};

module.exports = RolePermission;
