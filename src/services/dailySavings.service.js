const { startSession } = require('mongoose');
const { Package, Contribution, AccountTransaction, Account, Charge, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getAccountByNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { getUserById } = require('./user.service');
const { CONTRIBUTION_CIRCLE, ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { sendSms } = require('./sms.service');
const { welcomeMessage, dsContributionMessage } = require('../templates/sms/templates');
const { addLedgerEntry } = require('./accounting.service');

/**
 * Save a charge and update the count in the associated package
 * @param {Object} chargeInput - Charge input
 * @returns {Promise<Object>} Result of the operation
 */
const saveCharge = async (packageId, amount, createdBy, session) => {
  const PackageModel = await Package();
  const ChargeModel = await Charge();

  // Fetch the package details to get the branchId
  const packageDetails = await PackageModel.findById(packageId);
  if (!packageDetails) {
    throw new Error('Package not found');
  }

  const { branchId, userId } = packageDetails;
  const currentDate = new Date().getTime();

  // Create a new charge
  const newCharge = await ChargeModel.create(
    [
      {
        branchId,
        packageId,
        userId,
        date: currentDate,
        amount,
        createdBy,
        reason: 'DS charge',
      },
    ],
    { session }
  );

  // Update the count in the total count
  await ChargeModel.findByIdAndUpdate(newCharge._id, {
    $inc: { totalCount: 1 },
  });

  return newCharge;
};

/**
 * Create a daily savings package
 * @param {Object} dailyInput - Daily savings package input
 * @returns {Promise<Object>} Result of the operation
 */
const createDailySavingsPackage = async (dailyInput) => {
  const PackageModel = await Package();
  const AccountModel = await Account();
  const userAccount = await getAccountByNumber(dailyInput.accountNumber);
  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }
  const userPackageExist = await PackageModel.findOne({
    accountNumber: dailyInput.accountNumber,
    status: 'open',
    target: dailyInput.target,
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }
  const branch = await AccountModel.findOne({ accountNumber: dailyInput.accountNumber });
  const createdPackage = await PackageModel.create({
    ...dailyInput,
    userId: userAccount.userId,
    branchId: branch.branchId,
  });

  // Send welcome SMS

  const phone = userAccount.phoneNumber;
  const message = welcomeMessage(userAccount.firstName, dailyInput.accountNumber, dailyInput.target);
  await sendSms(phone, message);

  return createdPackage;
};

/**
 * Save a daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */
const saveDailyContribution = async (contributionInput) => {
  const session = await startSession();
  session.startTransaction();

  const PackageModel = await Package();
  const ContributionModel = await Contribution();
  const AccountModel = await Account();
  const AccountTransactionModel = await AccountTransaction();
  const UserModel = await User();

  try {
    const userAccount = await getAccountByNumber(contributionInput.accountNumber);

    if (!userAccount) {
      throw new ApiError(404, 'Account number does not exist.');
    }

    const userPackage = await PackageModel.findOne({
      accountNumber: contributionInput.accountNumber,
      status: 'open',
      target: contributionInput.target,
    })
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!userPackage) {
      throw new ApiError(409, 'Customer does not have an active package');
    }

    if (contributionInput.amount % userPackage.amountPerDay !== 0) {
      throw new ApiError(400, `Amount is not valid for ${userPackage.amountPerDay} daily savings package`);
    }

    if (contributionInput.amount / userPackage.amountPerDay >= 30) {
      throw new ApiError(409, 'Amount too big');
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

    const branch = await AccountModel.findOne({ accountNumber: contributionInput.accountNumber });

    const newContribution = await ContributionModel.create(
      [
        {
          createdBy: contributionInput.createdBy,
          amount: contributionInput.amount,
          branchId: branch.branchId,
          accountNumber: contributionInput.accountNumber,
          packageId: userPackageId,
          count: contributionDaysCount,
          totalCount,
          date: currentDate,
          narration: `Daily contribution`,
        },
      ],
      { session }
    );

    userPackage.totalContribution += contributionInput.amount;

    // Consolidated update operations into a single findByIdAndUpdate call
    await PackageModel.findByIdAndUpdate(
      userPackageId,
      {
        $set: { totalCount },
        $inc: { totalContribution: contributionInput.amount },
      },
      { session }
    );

    // expected to take one in every CONTRIBUTION_CIRCLE
    let expectedDeduction = totalCount - (totalCount % CONTRIBUTION_CIRCLE);

    if (totalCount % CONTRIBUTION_CIRCLE > 0) {
      expectedDeduction += 1;
    }

    // Check for first contribution in each circle
    if (userPackage.deductionCount < expectedDeduction) {
      // Charge the user amountPerDay on the first savings of each cycle
      await PackageModel.findByIdAndUpdate(
        userPackageId,
        {
          $inc: {
            totalContribution: -userPackage.amountPerDay,
            deductionCount: expectedDeduction - userPackage.deductionCount,
            totalCharge: userPackage.amountPerDay,
          },
        },
        { session }
      );
      await saveCharge(userPackageId, userPackage.amountPerDay, contributionInput.createdBy, session);
    }

    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE[1],
      direction: DIRECTION_VALUE[0],
      date: currentDate,
      narration: 'Daily contribution',
      amount: contributionInput.amount,
      userId: userPackage.createdBy,
      branchId: branch.branchId,
    };

    await addLedgerEntry(addLedgerEntryInput, session);

    const transactionDate = new Date().getTime();

    const contributionTransaction = await AccountTransactionModel.create(
      [
        {
          accountNumber: contributionInput.accountNumber,
          amount: contributionInput.amount,
          createdBy: contributionInput.createdBy,
          branchId: branch.branchId,
          date: transactionDate,
          direction: 'inflow',
          narration: `Daily contribution`,
          userId: userAccount.userId,
        },
      ],
      { session }
    );

    const cashier = await UserModel.findById(contributionInput.createdBy);

    // Send credit SMS
    const phone = userAccount.phoneNumber;
    const message = dsContributionMessage(
      userAccount.firstName,
      contributionInput.amount,
      contributionInput.accountNumber,
      userPackage.totalContribution,
      cashier.firstName
    );
    await sendSms(phone, message);

    await session.commitTransaction();
    session.endSession();

    return { newContribution, contributionTransaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Make a daily savings withdrawal
 * @param {Object} withdrawal - Withdrawal details
 * @returns {Promise<Object>} Withdrawal details
 */
const makeDailySavingsWithdrawal = async (withdrawal) => {
  const PackageModel = await Package();
  const session = await startSession();
  session.startTransaction();

  try {
    const userPackage = await PackageModel.findOne(
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

    await PackageModel.findOneAndUpdate(
      { accountNumber: withdrawal.accountNumber, status: 'open', target: withdrawal.target },
      { totalContribution: balanceAfterWithdrawal },
      { session }
    );

    const withdrawalDetails = {
      accountNumber: withdrawal.accountNumber,
      amount: withdrawal.amount,
      createdBy: withdrawal.createdBy,
      narration: `Daily contribution withdrawal`,
    };

    await makeCustomerDeposit(withdrawalDetails, session);

    if (balanceAfterWithdrawal === 0) {
      await PackageModel.findOneAndUpdate(
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
  const PackageModel = await Package();
  const userPackage = await PackageModel.findById(packageId);
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
  const PackageModel = await Package();
  const userPackages = await PackageModel.find({
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
  const ContributionModel = await Contribution();
  const contribution = ContributionModel.find({ packageId });

  const user = await getUserById(contribution.product);
  const createdBy = user ? `${user.firstName} ${user.lastName}` : null;

  return { contribution, createdBy };
};

/**
 * Get all daily savings withdrawals with a specific narration for a given account number
 * @param {string} accountNumber - The account number to filter withdrawals by
 * @param {string} narration - The narration to filter withdrawals by
 * @returns {Promise<Array>} Array of withdrawals with the specified narration
 */
const getDailySavingsWithdrawals = async (accountNumber, narration) => {
  const AccountTransactionModel = await AccountTransaction();
  const withdrawals = await AccountTransactionModel.find({ accountNumber, narration });

  const user = await getUserById(withdrawals.createdBy);
  const createdBy = user ? `${user.firstName} ${user.lastName}` : null;

  return { withdrawals, createdBy };
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackages,
  getDailySavingsContributions,
  getDailySavingsWithdrawals,
  getDailySavingsPackageById,
};
