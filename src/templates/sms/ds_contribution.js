module.exports = (amount, accountNumber, totalContribution, createdBy) => {
  return `SURE-BANK
  Credit
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  DS Bal: ${totalContribution} NGN
  Sales Rep: ${createdBy}`;
};
