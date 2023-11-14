const { Account } = require('../../models');

const generateAccountNumber = async () => {
  let accountNumber;
  let isUnique = false;

  const AccountModel = await Account();

  while (!isUnique) {
    // Generate a 10-digit random number
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Check if the generated account number already exists in the database
    // eslint-disable-next-line no-await-in-loop
    const existingAccount = await AccountModel.findOne({ accountNumber }).exec();
    if (!existingAccount) {
      isUnique = true;
    }
  }

  return accountNumber;
};

module.exports = {
  generateAccountNumber,
};
