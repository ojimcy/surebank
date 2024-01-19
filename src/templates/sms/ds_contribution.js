module.exports = (firstName, amount, accountNumber, totalContribution, createdBy) => {
  return `SURE-BANK
  Credit: ${firstName}
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  DS Bal: ${totalContribution} NGN
  Sales Rep: ${createdBy}`;
};
