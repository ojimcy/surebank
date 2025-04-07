const { getConnection } = require('./connection');
const notificationPreferenceSchema = require('./notificationPreference.schema');

let model = null;

/**
 * @returns NotificationPreference
 */
const NotificationPreference = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('NotificationPreference', notificationPreferenceSchema);
  }

  return model;
};

module.exports = NotificationPreference;
