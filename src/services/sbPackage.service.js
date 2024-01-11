const { startSession } = require('mongoose');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { SbPackage, Account, Contribution, AccountTransaction, ProductCatalogue } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');
const { getProductCatalogueById } = require('./product.service');
const { tmpls, sendSms } = require('./sms.service');
const { constributionMessage } = require('../templates/sms/templates');

const createSbPackage = async (sbPackageData) => {
  const userAccount = await getUserByAccountNumber(sbPackageData.accountNumber);

  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  const userPackageExist = await SbPackage.findOne({
    accountNumber: sbPackageData.accountNumber,
    status: 'open',
    product: sbPackageData.product,
  })
    .populate('createdBy', 'firstName lastName')
    .lean();

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  const product = await ProductCatalogue.findById(sbPackageData.product);

  if (!product || !product.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }

  const startDate = new Date().getTime();

  const savingsBuyingPackage = await SbPackage.create({
    ...sbPackageData,
    userId: userAccount.userId,
    targetAmount: product.price,
    image: product.images[1],
    startDate,
  });

  // Send welcome SMS
  const phone = userAccount.phoneNumber;
  const welcomeMessageTemplate = tmpls.WELCOME;
  const vars = {
    name: userAccount.firstName,
    accountNumber: sbPackageData.accountNumber,
    target: savingsBuyingPackage.targetAmount,
  };

  await sendSms({ phone, template: welcomeMessageTemplate, vars });

  return savingsBuyingPackage;
};

/**
 * Make daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */

const makeDailyContribution = async (contributionInput) => {
  const userAccount = await getUserByAccountNumber(contributionInput.accountNumber);
  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  const userPackage = await SbPackage.findOne({
    accountNumber: contributionInput.accountNumber,
    status: 'open',
    product: contributionInput.product,
  });

  if (!userPackage) {
    throw new ApiError(409, 'Customer does not have an active package');
  }

  const userPackageId = userPackage._id;
  const currentDate = new Date().getTime();

  if (userPackage.status === 'closed') {
    throw new ApiError(403, 'This package has been closed');
  }

  const branch = await Account.findOne({
    accountNumber: contributionInput.accountNumber,
  });

  const newContribution = await Contribution.create({
    createdBy: contributionInput.createdBy,
    amount: contributionInput.amount,
    branchId: branch.branchId,
    accountNumber: contributionInput.accountNumber,
    packageId: userPackageId,
    date: currentDate,
    narration: `SB contribution`,
  });

  userPackage.totalContribution += contributionInput.amount;

  await SbPackage.findByIdAndUpdate(userPackageId, {
    totalContribution: userPackage.totalContribution,
  });

  const addLedgerEntryInput = {
    type: ACCOUNT_TYPE.sb,
    direction: DIRECTION_VALUE.inflow,
    date: currentDate,
    narration: 'SB contribution',
    amount: contributionInput.amount,
    userId: userPackage.createdBy,
    branchId: branch.branchId,
  };

  await addLedgerEntry(addLedgerEntryInput);

  const transactionDate = new Date().getTime();

  const contributionTransaction = await AccountTransaction.create({
    accountNumber: userPackage.accountNumber,
    amount: contributionInput.amount,
    createdBy: contributionInput.createdBy,
    branchId: branch.branchId,
    date: transactionDate,
    direction: 'inflow',
    narration: `SB Daily contribution`,
  });

  // Send credit SMS
  const phone = userAccount.phoneNumber;
  const message = constributionMessage(
    contributionInput.amount,
    contributionInput.accountNumber,
    userPackage.totalContribution,
    contributionInput.createdBy.firstName
  );
  await sendSms(phone, message);

  return {
    newContribution,
    contributionTransaction,
  };
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
    const userPackage = await SbPackage.findOne(
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

    await SbPackage.findOneAndUpdate(
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
      await SbPackage.findOneAndUpdate(
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
  const userPackage = await SbPackage.findById(packageId).populate({
    path: 'product',
    select: ['name', 'images', 'price', 'salesPrice'],
  });
  if (!userPackage) {
    throw new ApiError(404, 'Package not found!!!');
  }
  return userPackage;
};

/**
 * Get the user's daily savings packages
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's daily savings packages
 */
const getUserSbPackages = async (userId) => {
  const userPackages = await SbPackage.find({
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

/**
 * Merge savings packages into a single package
 * @param {string} targetPackageId - ID of the package to merge contributions into
 * @param {Array<string>} sourcePackageIds - Array of  package IDs to be merged (excluding the target package)
 * @returns {Promise<Object>} Result of the operation
 */
const mergeSavingsPackages = async (targetPackageId, sourcePackageIds) => {
  const session = await startSession();
  session.startTransaction();

  try {
    // Fetch and validate the packages to be merged
    const targetPackage = await SbPackage.findById(targetPackageId).session(session);
    if (!targetPackage || targetPackage.status !== 'open') {
      throw new ApiError(404, 'Target package is not valid.');
    }
    const userAccount = await getUserByAccountNumber(targetPackage.accountNumber);

    const sourcePackages = await SbPackage.find({
      _id: { $in: sourcePackageIds },
      status: 'open',
    }).session(session);

    if (sourcePackages.length !== sourcePackageIds.length) {
      throw new ApiError(404, 'One or more source packages are not valid.');
    }
    // Transfer contributions from source packages to the target package
    // eslint-disable-next-line no-restricted-syntax
    for (const sourcePackage of sourcePackages) {
      targetPackage.totalContribution += sourcePackage.totalContribution;
      // eslint-disable-next-line no-await-in-loop
      await Contribution.updateMany({ packageId: sourcePackage._id }, { packageId: targetPackage._id }, { session });
    }

    // Save the updated totalContribution to the database
    await targetPackage.save();

    // Create an AccountTransaction for the merge
    const currentDate = new Date().getTime();

    await AccountTransaction.create({
      accountNumber: targetPackage.accountNumber,
      amount: targetPackage.totalContribution,
      createdBy: targetPackage.userId,
      branchId: userAccount.branchId,
      date: currentDate,
      direction: 'inflow',
      narration: 'Savings packages merged',
    });

    // Close the source packages
    await SbPackage.updateMany({ _id: { $in: sourcePackageIds } }, { status: 'closed' }, { session });
    // Record the merge in the ledger
    const mergeLedgerEntryInput = {
      type: 'SB Merge',
      direction: 'inflow',
      date: currentDate,
      narration: 'Savings packages merged',
      amount: targetPackage.totalContribution,
      userId: targetPackage.userId,
      branchId: targetPackage.branchId,
    };

    await addLedgerEntry(mergeLedgerEntryInput, session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return targetPackage;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
  getPackageById,
  getUserSbPackages,
  mergeSavingsPackages,
};
