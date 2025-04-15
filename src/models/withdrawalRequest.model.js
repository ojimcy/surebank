const mongoose = require('mongoose');
const withdrawalRequestSchema = require('./withdrawalRequest.schema');

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
