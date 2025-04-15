const mongoose = require('mongoose');
const virtualAccountSchema = require('./virtualAccount.schema');

const VirtualAccount = mongoose.model('VirtualAccount', virtualAccountSchema);

module.exports = VirtualAccount;
