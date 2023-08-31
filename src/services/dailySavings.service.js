const { startSession } = require('mongoose');
const { Package, Contribution, AccountTransaction, Account } = require('../models');
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
    target: dailyInput.target,
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }
  const branch = await Account.findOne({ accountNumber: dailyInput.accountNumber });
  const createdPackage = await Package.create({
    ...dailyInput,
    userId: confirmAccountNumber._id,
    branchId: branch.branchId,
  });

  return createdPackage;
};

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
    target: contributionInput.target,
  });

  if (!userPackage) {
    throw new ApiError(409, 'Customer does not have an active package');
  }

  if (contributionInput.amount % userPackage.amountPerDay !== 0) {
    throw new ApiError(400, `Amount is not valid for ${userPackage.amountPerDay} daily savings package`);
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

  if (totalCount > 31) {
    throw new ApiError(400, 'Total contribution count cannot exceed 31');
  }
  const branch = await Account.findOne({ accountNumber: contributionInput.accountNumber });
  const newContribution = await Contribution.create({
    userReps: contributionInput.userReps,
    amount: contributionInput.amount,
    branchId: branch.branchId,
    accountNumber: contributionInput.accountNumber,
    packageId: userPackageId,
    count: contributionDaysCount,
    totalCount,
    date: currentDate,
    narration: `Daily contribution`,
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
      branchId: branch.branchId,
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
      userReps: userPackage.userReps,
      narration,
    };

    await makeCustomerDeposit(depositDetail);

    // Close the package and reset total contribution count to 0
    await Package.findByIdAndUpdate(userPackageId, {
      status: 'closed',
      totalContribution: 0,
      totalCount: 0,
    });
  } else {
    const transactionDate = new Date().getTime();

    const contributionTransaction = await AccountTransaction.create({
      accountNumber: contributionInput.accountNumber,
      amount: contributionInput.amount,
      userReps: contributionInput.userReps,
      branchId: branch.branchId,
      date: transactionDate,
      direction: 'inflow',
      narration: `Daily contribution`,
    });

    return { newContribution, contributionTransaction };
  }
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
        target: withdrawal.target,
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
      { accountNumber: withdrawal.accountNumber, status: 'open', target: withdrawal.target },
      { totalContribution: balanceAfterWithdrawal },
      { session }
    );

    const withdrawalDetails = {
      accountNumber: withdrawal.accountNumber,
      amount: withdrawal.amount,
      userReps: withdrawal.userReps,
      narration: `Daily contribution withdrawal`,
    };

    await makeCustomerDeposit(withdrawalDetails, session);

    if (balanceAfterWithdrawal === 0) {
      await Package.findOneAndUpdate(
        { accountNumber: withdrawal.accountNumber, status: 'open' },
        { status: 'closed' },
        { session }
      );
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
 * Get a single daily savings package by ID
 * @param {string} packageId - Package ID
 * @returns {Promise<Object>} Daily savings package
 */
const getDailySavingsPackageById = async (packageId) => {
  const userPackage = await Package.findById(packageId).populate('userId', 'firstName lastName');
  if (!userPackage) {
    throw new ApiError(404, 'Daily savings package not found');
  }
  return userPackage;
};

/**
 * Get the user's daily savings packages
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's daily savings packages
 */
const getUserDailySavingsPackages = async (userId) => {
  const userPackages = await Package.find({
    userId,
    status: 'open',
  });

  return userPackages;
};

/**
 * Get all contributions for a package
 * @param {string} packageId - Package ID
 * @returns {Promise<Array>} Array of contributions
 */
const getDailySavingsContributions = async (packageId) => {
  try {
    return await Contribution.find({ packageId }).populate('userReps', 'firstName lastName').lean();
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
    const withdrawals = await AccountTransaction.find({ accountNumber, narration })
      .populate('userReps', 'firstName lastName')
      .lean();
    return withdrawals;
  } catch (error) {
    throw new ApiError('Failed to get daily savings withdrawals', error);
  }
};

/**
 * Get ds withdrawals within a date range
 * @param {Date} [startDate] - Start date of the range
 * @param {Date} [endDate] - End date of the range
 * @param {string} [branchId] - Optional branch ID to filter by
 * @param {string} [userId] - Optional user ID to filter by
 * @returns {Promise<Array>} Array of ds withdrawals
 */
const getDsWithdrawals = async (startDate, endDate, branchId, userReps) => {
  try {
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (startDate) {
      query.date = { $gte: startDate };
    }
    if (endDate) {
      query.date = { $lte: endDate };
    }

    if (branchId) {
      query.branchId = branchId;
    }

    if (userReps) {
      query.userReps = userReps;
    }

    query.narration = 'Daily contribution withdrawal';
    const withdrawals = await AccountTransaction.find(query)
      .populate([
        {
          path: 'userReps',
          select: 'firstName lastName',
        },
        {
          path: 'branchId',
          select: 'name',
        },
      ])
      .sort({ date: -1 })
      .lean();
    return withdrawals;
  } catch (error) {
    throw new ApiError('Failed to fetch ds withdrawals', error);
  }
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackages,
  getDailySavingsContributions,
  getDailySavingsWithdrawals,
  getDsWithdrawals,
  getDailySavingsPackageById,
};
