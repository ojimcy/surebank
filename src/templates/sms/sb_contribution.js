module.exports = (customerName, amount, accountNumber, totalContribution, createdBy) => {
  return `SURE-BANK
  Credit: ${customerName}
  Amt: ${amount} NGN
  Acc: ${accountNumber}
  SB Bal: ${totalContribution} NGN
  Sales Rep: ${createdBy}`;
};
