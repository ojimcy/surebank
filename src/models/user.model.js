const { getConnection } = require('./connection');
const userSchema = require('./user.schema');

let model = null;

/**
 * @returns User
 */
const User = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('User', userSchema);
  }

  return model;
};

module.exports = User;
