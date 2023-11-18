const { getConnection } = require('./connection');
const notificationSchema = require('./notification.schema');

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
