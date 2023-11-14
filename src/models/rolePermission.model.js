const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const rolePermissionSchema = mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
rolePermissionSchema.plugin(toJSON);
rolePermissionSchema.plugin(paginate);

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
