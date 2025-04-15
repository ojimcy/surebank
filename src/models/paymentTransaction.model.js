const mongoose = require('mongoose');
const paymentTransactionSchema = require('./paymentTransaction.schema');

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

module.exports = PaymentTransaction;
