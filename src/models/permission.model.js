const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const permissionSchema = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    merchantPermission: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

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
