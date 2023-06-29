const TransactionTypes = {
  TRANSFER: 'Transfer',
  SWAP: 'Swap',
  DEPOSIT: 'Fund wallet',
  WITHDRAWAL: 'Withdrawal',
  FIAT_DEPOSIT: 'Fiat deposit',
  FIAT_WITHDRAWAL: 'Fiat withdrawal',
  P2P_FEES: 'P2P fees',
};

const TransactionDirection = {
  CREDIT: 'Credit',
  Debit: 'Debit',
};

const TransactionStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
  COMPLETED: 'Completed',
};

const TransactionStatuses = [
  TransactionStatus.PENDING,
  TransactionStatus.PROCESSING,
  TransactionStatus.FAILED,
  TransactionStatus.COMPLETED,
  TransactionStatus.APPROVED,
  TransactionStatus.REJECTED,
];

module.exports = {
  TransactionDirection,
  TransactionTypes,
  TransactionStatus,
  TransactionStatuses,
};
