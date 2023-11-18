const { getConnection } = require('./connection');
const permissionSchema = require('./permission.schema');

let model = null;

/**
 * @returns Permission
 */
const Permission = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Permission', permissionSchema);
  }

  return model;
};

module.exports = Permission;
