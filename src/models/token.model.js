const { getConnection } = require('./connection');
const tokenSchema = require('./token.schema');

let model = null;

/**
 * @returns Token
 */
const Token = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Token', tokenSchema);
  }

  return model;
};

module.exports = Token;
