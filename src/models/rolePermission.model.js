const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const rolePermissionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: String,
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

/**
 * @typedef RolePermission
 */
const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;
