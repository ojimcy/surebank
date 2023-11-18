const { getConnection } = require('./connection');
const optSchema = require('./otp.schema');

let model = null;

/**
 * @returns Opt
 */
const Opt = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Opt', optSchema);
  }

  return model;
};

module.exports = Opt;
