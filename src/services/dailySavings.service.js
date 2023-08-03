const { startSession } = require('mongoose');
const { Package, Contribution, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');

/**
 * Create a daily savings package
 * @param {Object} dailyInput - Daily savings package input
 * @returns {Promise<Object>} Result of the operation
 */
const createDailySavingsPackage = async (dailyInput) => {
  const confirmAccountNumber = await getUserByAccountNumber(dailyInput.accountNumber);
  if (!confirmAccountNumber) {
    throw new ApiError(404, 'Account number does not exist.');
  }
  const userPackageExist = await Package.findOne({
    accountNumber: dailyInput.accountNumber,
    status: 'open',
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  const createdPackage = await Package.create({
    ...dailyInput,
    userId: confirmAccountNumber._id,
  });

  return createdPackage;
};

// /**
//  * Count contributions for a package
//  * @param {Object} input - Input data
//  * @param {string} input.packageId - Package ID
//  * @returns {Promise<number>} Total count of contributions
//  */
// const countContribution = async ({ packageId }) => {
//   try {
//     const totalCount = await Contribution.aggregate([
//       {
//         $match: {
//           packageId,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           TotalCount: {
//             $sum: '$count',
//           },
//         },
//       },
//     ]);
//     return totalCount[0].TotalCount;
//   } catch (error) {
//     throw new ApiError('Failed to count contributions', error);
//   }
// };

/**
 * Save a daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */
const saveDailyContribution = async (contributionInput) => {
  const confirmAccountNumber = await getUserByAccountNumber(contributionInput.accountNumber);
  if (!confirmAccountNumber) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  const userPackage = await Package.findOne({
    accountNumber: contributionInput.accountNumber,
    status: 'open',
  });

  if (!userPackage) {
    throw new ApiError(409, 'Customer does not have an active package');
  }

  if (contributionInput.amount % userPackage.amountPerDay !== 0) {
    throw new ApiError(400, `Amount is not valid for ${userPackage.amountPerDay} daily savings`);
  }

  const userPackageId = userPackage._id;
  const contributionDaysCount = contributionInput.amount / userPackage.amountPerDay;
  const currentDate = new Date().getTime();

  if (contributionInput.amount < userPackage.amountPerDay) {
    throw new ApiError(400, `Amount cannot be less than ${userPackage.amountPerDay}`);
  }

  if (userPackage.status === 'closed') {
    throw new ApiError(403, 'This package has been closed');
  }

  // Calculate the new total count by adding contributionDaysCount to the existing value
  const totalCount = userPackage.totalCount + contributionDaysCount;

  const newContribution = await Contribution.create({
    userReps: contributionInput.userReps,
    amount: contributionInput.amount,
    accountNumber: contributionInput.accountNumber,
    packageId: userPackageId,
    count: contributionDaysCount,
    totalCount,
    date: currentDate,
    narration: 'Daily contribution',
  });

  userPackage.totalContribution += contributionInput.amount;

  if (userPackage.hasBeenCharged === false) {
    userPackage.totalContribution -= userPackage.amountPerDay;
    await Package.findByIdAndUpdate(userPackageId, {
      hasBeenCharged: true,
    });

    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE.ds,
      direction: DIRECTION_VALUE.inflow,
      date: currentDate,
      narration: 'Daily contribution',
      amount: userPackage.amountPerDay,
      userId: userPackage.userReps,
      branchId: contributionInput.branchId,
    };
    await addLedgerEntry(addLedgerEntryInput);
  }

  await Package.findByIdAndUpdate(userPackageId, {
    totalContribution: userPackage.totalContribution,
  });

  // Update the total contribution count in the Package model
  await Package.findByIdAndUpdate(userPackageId, {
    $set: { totalCount }, // Update the totalCount field with the new value
  });

  if (totalCount === 31) {
    const narration = 'Total contribution';
    const depositDetail = {
      accountNumber: contributionInput.accountNumber,
      amount: userPackage.totalContribution,
      operatorId: userPackage.userReps,
      narration,
    };

    await makeCustomerDeposit(depositDetail);

    // Close the package and reset total contribution count to 0
    await Package.findByIdAndUpdate(userPackageId, {
      status: 'closed',
      totalContribution: 0,
      totalCount: 0,
    });
  }

  const transactionDate = new Date().getTime();

  const contributionTransaction = await AccountTransaction.create({
    accountNumber: contributionInput.accountNumber,
    amount: contributionInput.amount,
    operatorId: contributionInput.userReps,
    date: transactionDate,
    direction: 'inflow',
    narration: 'Daily contribution',
  });

  return { newContribution, contributionTransaction };
};

/**
 * Make a daily savings withdrawal
 * @param {Object} withdrawal - Withdrawal details
 * @returns {Promise<Object>} Withdrawal details
 */
const makeDailySavingsWithdrawal = async (withdrawal) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const userPackage = await Package.findOne(
      {
        accountNumber: withdrawal.accountNumber,
        status: 'open',
      },
      null,
      { session }
    );

    if (!userPackage) {
      throw new ApiError(404, 'User does not have an active daily savings package');
    }

    if (userPackage.totalContribution < withdrawal.amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    const balanceAfterWithdrawal = userPackage.totalContribution - withdrawal.amount;

    await Package.findOneAndUpdate(
      { accountNumber: withdrawal.accountNumber },
      { totalContribution: balanceAfterWithdrawal },
      { session }
    );

    const withdrawalDetails = {
      accountNumber: withdrawal.accountNumber,
      amount: withdrawal.amount,
      operatorId: withdrawal.userReps,
      narration: 'Daily contribution withdrawal',
    };

    await makeCustomerDeposit(withdrawalDetails, session);

    if (balanceAfterWithdrawal === 0) {
      await Package.findOneAndUpdate({ accountNumber: withdrawal.accountNumber }, { status: 'closed' }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return withdrawalDetails;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get the user's daily savings package
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's daily savings package
 */
const getUserDailySavingsPackage = async (userId) => {
  const userPackage = await Package.findOne({
    userId,
    status: 'open',
  });

  return userPackage;
};

/**
 * Get all contributions for a package
 * @param {string} packageId - Package ID
 * @returns {Promise<Array>} Array of contributions
 */
const getDailySavingsContributions = async (packageId) => {
  try {
    return await Contribution.find({ packageId }).lean();
  } catch (error) {
    throw new ApiError('Failed to get contributions for the package', error);
  }
};

/**
 * Get all daily savings withdrawals with a specific narration for a given account number
 * @param {string} accountNumber - The account number to filter withdrawals by
 * @param {string} narration - The narration to filter withdrawals by
 * @returns {Promise<Array>} Array of withdrawals with the specified narration
 */
const getDailySavingsWithdrawals = async (accountNumber, narration) => {
  try {
    const withdrawals = await AccountTransaction.find({ accountNumber, narration });
    return withdrawals;
  } catch (error) {
    throw new ApiError('Failed to get daily savings withdrawals', error);
  }
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackage,
  getDailySavingsContributions,
  getDailySavingsWithdrawals,
};
