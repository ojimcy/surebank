const { getConnection } = require('./connection');
const paymentTransactionSchema = require('./paymentTransaction.schema');

let model = null;

/**
 * @returns PaymentTransaction
 */
const PaymentTransaction = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('PaymentTransaction', paymentTransactionSchema);
  }

  return model;
};

module.exports = PaymentTransaction;
