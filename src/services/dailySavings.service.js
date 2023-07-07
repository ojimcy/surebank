const { Package, Contribution } = require('../models');
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
  });

  return createdPackage;
};

/**
 * Count contributions for a package
 * @param {Object} input - Input data
 * @param {string} input.packageId - Package ID
 * @returns {Promise<number>} Total count of contributions
 */
const countContribution = async ({ packageId }) => {
  try {
    const totalCount = await Contribution.aggregate([
      {
        $match: {
          packageId,
        },
      },
      {
        $group: {
          _id: null,
          TotalCount: {
            $sum: '$count',
          },
        },
      },
    ]);
    return totalCount[0].TotalCount;
  } catch (error) {
    throw new ApiError('Failed to count contributions', error);
  }
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

  const newContribution = await Contribution.create({
    userReps: contributionInput.userReps,
    amount: contributionInput.amount,
    accountNumber: contributionInput.accountNumber,
    packageId: userPackageId,
    count: contributionDaysCount,
    date: currentDate,
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

  const packageId = userPackageId;
  const numberOfDays = await countContribution({ packageId });

  if (numberOfDays === 31) {
    const narration = 'Total contribution';
    const depositDetail = {
      accountNumber: contributionInput.accountNumber,
      amount: userPackage.totalContribution,
      operatorId: userPackage.userReps,
      narration,
    };

    await makeCustomerDeposit(depositDetail);

    await Package.findByIdAndUpdate(userPackageId, {
      status: 'closed',
      totalContribution: 0,
    });
  }

  return newContribution;
};

/**
 * Make a daily savings withdrawal
 * @param {Object} withdrawal - Withdrawal details
 * @returns {Promise<Object>} Withdrawal details
 */
const makeDailySavingsWithdrawal = async (withdrawal) => {
  const userPackage = await Package.findOne({
    accountNumber: withdrawal.accountNumber,
    status: 'open',
  });

  if (userPackage.totalContribution < withdrawal.amount) {
    throw new ApiError(400, 'Insufficient balance');
  }

  const balanceAfterWithdrawal = userPackage.totalContribution - withdrawal.amount;

  await Package.findOneAndUpdate({ accountNumber: withdrawal.accountNumber }, { totalContribution: balanceAfterWithdrawal });

  const withdrawalDetails = {
    accountNumber: withdrawal.accountNumber,
    amount: withdrawal.amount,
    salesRepId: withdrawal.userReps,
    narration: 'Daily contribution withdrawal',
  };

  await makeCustomerDeposit(
    withdrawalDetails.accountNumber,
    withdrawalDetails.amount,
    withdrawalDetails.salesRepId,
    withdrawalDetails.narration
  );

  if (balanceAfterWithdrawal === 0) {
    await Package.findOneAndUpdate({ accountNumber: withdrawal.accountNumber }, { status: 'closed' });
  }

  return withdrawalDetails;
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
};
