const mongoose = require('mongoose');

const startSession = async () => {
  const session = await mongoose.startSession();

  if (session.transaction != null) {
    // A transaction is already in progress
    throw new Error('Transaction already in progress');
  }

  session.startTransaction();
  return session;
};

module.exports = {
  startSession,
};
