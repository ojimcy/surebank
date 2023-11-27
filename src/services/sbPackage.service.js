const { startSession } = require('mongoose');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { SbPackage, Account, Contribution, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');
const { getProductCatalogueById } = require('./product.service');

const createSbPackage = async (sbPackageData) => {
  const SbPackageModel = await SbPackage();
  const userAccount = await getUserByAccountNumber(sbPackageData.accountNumber);

  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  if (userAccount.accountType !== 'sb') {
    throw new ApiError(404, 'Provide a valid DS account number');
  }

  const userPackageExist = await SbPackageModel.findOne({
    accountNumber: sbPackageData.accountNumber,
    status: 'open',
    product: sbPackageData.product,
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  const product = await getProductCatalogueById(sbPackageData.product);

  if (!product || !product.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }

  const amountPerDay = parseFloat((product.price / 31).toFixed(2));
  const startDate = new Date().getTime();

  const savingsBuyingPackage = await SbPackageModel.create({
    ...sbPackageData,
    userId: userAccount.userId,
    targetAmount: product.price,
    image: product.images[1],
    amountPerDay,
    startDate,
  });

  return savingsBuyingPackage;
};

/**
 * Make daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */

const makeDailyContribution = async (contributionInput) => {
  const AccountTransactionModel = await AccountTransaction();
  const ContributionModel = await Contribution();
  const AccountModel = await Account();
  const SbPackageModel = await SbPackage();

  const userAccount = await getUserByAccountNumber(contributionInput.accountNumber);
  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }
  const userPackage = await SbPackageModel.findOne({
    accountNumber: contributionInput.accountNumber,
    status: 'open',
    product: contributionInput.product,
  });

  if (!userPackage) {
    throw new ApiError(409, 'Customer does not have an active package');
  }

  const userPackageId = userPackage._id;
  const contributionDaysCount = contributionInput.amount / userPackage.amountPerDay;
  const currentDate = new Date().getTime();
  const { amountPerDay } = userPackage;

  if (contributionInput.amount < amountPerDay) {
    throw new ApiError(400, `Amount cannot be less than ${amountPerDay}`);
  }

  if (userPackage.status === 'closed') {
    throw new ApiError(403, 'This package has been closed');
  }

  // Calculate the new total count by adding contributionDaysCount to the existing value
  const totalCount = userPackage.totalCount + contributionDaysCount;

  if (totalCount > 31) {
    throw new ApiError(400, 'Total contribution count cannot exceed 31');
  }

  const branch = await AccountModel.findOne({
    accountNumber: contributionInput.accountNumber,
  });

  const newContribution = await ContributionModel.create({
    createdBy: contributionInput.createdBy,
    amount: contributionInput.amount,
    branchId: branch.branchId,
    accountNumber: contributionInput.accountNumber,
    packageId: userPackageId,
    count: contributionDaysCount,
    totalCount,
    date: currentDate,
    narration: `SB Daily contribution`,
  });

  userPackage.totalContribution = contributionInput.amount;

  if (!userPackage.hasBeenCharged) {
    userPackage.totalContribution -= userPackage.amountPerDay;

    await SbPackageModel.findByIdAndUpdate(userPackageId, {
      hasBeenCharged: true,
    });

    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE.sb,
      direction: DIRECTION_VALUE.inflow,
      date: currentDate,
      narration: 'Daily contribution',
      amount: amountPerDay,
      userId: userPackage.createdBy,
      branchId: branch.branchId,
    };

    await addLedgerEntry(addLedgerEntryInput);
  }

  await SbPackageModel.findByIdAndUpdate(userPackageId, {
    totalContribution: userPackage.totalContribution,
  });

  await SbPackageModel.findByIdAndUpdate(userPackageId, {
    $set: {
      totalCount,
    },
  });

  if (totalCount === 31) {
    const narration = 'Total contribution';
    const depositDetail = {
      accountNumber: contributionInput.accountNumber,
      amount: userPackage.totalContribution,
      createdBy: userPackage.createdBy,
      narration,
    };

    await makeCustomerDeposit(depositDetail);

    await SbPackageModel.findByIdAndUpdate(userPackageId, {
      status: 'closed',
      totalContribution: 0,
      totalCount: 0,
    });
  } else {
    const transactionDate = new Date().getTime();

    const contributionTransaction = await AccountTransactionModel.create({
      accountNumber: userPackage.accountNumber,
      amount: contributionInput.amount,
      createdBy: contributionInput.createdBy,
      branchId: branch.branchId,
      date: transactionDate,
      direction: 'inflow',
      narration: `SB Daily contribution`,
    });

    return {
      newContribution,
      contributionTransaction,
    };
  }
};

/**
 * Make a daily savings withdrawal
 * @param {Object} withdrawal - Withdrawal details
 * @returns {Promise<Object>} Withdrawal details
 */
const makeSbWithdrawal = async (withdrawal) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const SbPackageModel = await SbPackage();
    const userPackage = await SbPackageModel.findOne(
      {
        accountNumber: withdrawal.accountNumber,
        status: 'open',
        product: withdrawal.product,
      },
      null,
      { session }
    );

    if (!userPackage) {
      throw new ApiError(404, 'User does not have an active Package');
    }

    if (userPackage.totalContribution < withdrawal.amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    const balanceAfterWithdrawal = userPackage.totalContribution - withdrawal.amount;

    await SbPackageModel.findOneAndUpdate(
      { accountNumber: withdrawal.accountNumber, status: 'open', product: withdrawal.product },
      { totalContribution: balanceAfterWithdrawal },
      { session }
    );

    const withdrawalDetails = {
      accountNumber: withdrawal.accountNumber,
      amount: withdrawal.amount,
      createdBy: withdrawal.createdBy,
      narration: `SB Daily contribution transfer`,
    };

    await makeCustomerDeposit(withdrawalDetails, session);

    if (balanceAfterWithdrawal === 0) {
      await SbPackageModel.findOneAndUpdate(
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
 * Get a single Package by ID
 * @param {string} packageId - Package ID
 * @returns {Promise<Object>} Package
 */
const getPackageById = async (packageId) => {
  const SbPackageModel = await SbPackage();
  const userPackage = await SbPackageModel.findById(packageId);
  if (!userPackage) {
    throw new ApiError(404, 'Package not found!!!');
  }
  const productCat = await getProductCatalogueById(userPackage.product);
  return { ...userPackage.toObject(), product: productCat };
};

/**
 * Get the user's daily savings packages
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's daily savings packages
 */
const getUserSbPackages = async (userId) => {
  const SbPackageModel = await SbPackage();
  const userPackages = await SbPackageModel.find({
    userId,
    status: 'open',
  });

  const packagesWithProducts = await Promise.all(
    userPackages.map(async (userPackage) => {
      const productCat = await getProductCatalogueById(userPackage.product);

      const updatedUserPackage = { ...userPackage.toObject(), product: productCat };

      return updatedUserPackage;
    })
  );

  return packagesWithProducts;
};

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
  getPackageById,
  getUserSbPackages,
};
