const mongoose = require('mongoose');
const interestPackageSchema = require('./interestPackage.schema');

const InterestPackage = mongoose.model('InterestPackage', interestPackageSchema);

module.exports = InterestPackage;
