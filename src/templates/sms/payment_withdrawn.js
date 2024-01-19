module.exports = (customerName, amount, accountNumber, availableBalance, createdBy) => {
  return `SURE-BANK
  Debit: ${customerName}
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  Avail Bal: ${availableBalance} NGN
  Cashier: ${createdBy}`;
};
