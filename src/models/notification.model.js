const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      trim: true,
    },
    type: {
      type: Number,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

let model = null;

/**
 * @returns Notification
 */
const Notification = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Notification', notificationSchema);
  }

  return model;
};

module.exports = Notification;
