module.exports = (amount, accountNumber, availableBalance, createdBy) => {
  return `SURE-BANK
  Debit
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  Avail Bal: ${availableBalance} NGN
  Cashier: ${createdBy}`;
};
