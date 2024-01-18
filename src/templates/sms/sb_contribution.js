module.exports = (amount, accountNumber, totalContribution, createdBy) => {
  return `SURE-BANK
  Credit
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  SB Bal: ${totalContribution} NGN
  Sales Rep: ${createdBy}`;
};
