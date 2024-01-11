module.exports = (amount, accountNumber, totalContribution, createdBy) => {
  return `SURE-BANK
  Credit
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  Total Contrib: ${totalContribution} NGN
  Cashier: ${createdBy}`;
};
