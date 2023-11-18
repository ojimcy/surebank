const { getConnection } = require('./connection');
const customerSchema = require('./customer.schema');

let model = null;

/**
 * @returns Customer
 */
const Customer = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Customer', customerSchema);
  }

  return model;
};

module.exports = Customer;
