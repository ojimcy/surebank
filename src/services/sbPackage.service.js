const mongoose = require('mongoose');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { SbPackage, Account, Contribution, AccountTransaction, ProductCatalogue, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getAccountByNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');
const { getProductCatalogueById } = require('./product.service');
const { sendSms } = require('./sms.service');
const { sbContributionMessage } = require('../templates/sms/templates');

const createSbPackage = async (sbPackageData) => {
  const SbPackageModel = await SbPackage();

  const userAccount = await getAccountByNumber(sbPackageData.accountNumber);

  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  if (userAccount.accountType !== 'sb') {
    throw new ApiError(404, 'Provide a valid DS account number');
  }

  const userPackage = await SbPackageModel.findOne({
    accountNumber: sbPackageData.accountNumber,
    status: 'open',
    product: sbPackageData.product,
  });

  if (userPackage) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  const product = await getProductCatalogueById(sbPackageData.product);

  if (!product || !product.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }
  const startDate = new Date().getTime();
  const sbPackage = await SbPackageModel.create({
    ...sbPackageData,
    userId: userAccount.userId,
    targetAmount: product.sellingPrice,
    image: product.images[1],
    branchId: userAccount.branchId,
    startDate,
    accountManagerId: userAccount.accountManagerId,
  });

  return sbPackage;
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
  const UserModel = await User();

  const userAccount = await getAccountByNumber(contributionInput.accountNumber);
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
  const currentDate = new Date().getTime();

  if (userPackage.status === 'closed') {
    throw new ApiError(403, 'This package has been closed');
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
    date: currentDate,
    paymentMethod: contributionInput.paymentMethod,
    narration: `SB contribution`,
  });

  const addLedgerEntryInput = {
    type: ACCOUNT_TYPE[2],
    direction: DIRECTION_VALUE[0],
    date: currentDate,
    narration: 'SB contribution',
    amount: contributionInput.amount,
    userId: userPackage.createdBy,
    branchId: branch.branchId,
  };

  await addLedgerEntry(addLedgerEntryInput);

  const transactionDate = new Date().getTime();

  const contributionTransaction = await AccountTransactionModel.create({
    accountNumber: userPackage.accountNumber,
    amount: contributionInput.amount,
    createdBy: contributionInput.createdBy,
    branchId: branch.branchId,
    date: transactionDate,
    direction: 'inflow',
    paymentMethod: contributionInput.paymentMethod,
    narration: `SB Daily contribution - ${contributionInput.paymentMethod}`,
    userId: userAccount.userId,
  });

  userPackage.totalContribution += contributionInput.amount;
  // userPackage.totalContribution -= SMS_FFE;

  // Update total contribution and charge SMS fees atomically
  await SbPackageModel.findByIdAndUpdate(userPackageId, {
    totalContribution: userPackage.totalContribution,
  });

  const cashier = await UserModel.findById(contributionInput.createdBy);

  // Send credit SMS
  const phone = userAccount.phoneNumber;
  const message = sbContributionMessage(
    userAccount.firstName,
    contributionInput.amount,
    contributionInput.accountNumber,
    userPackage.totalContribution,
    cashier.firstName
  );
  await sendSms(phone, message);

  // // Charge for SMS fees
  //  await chargeSmsFees(phone, 1, contributionInput.createdBy, branch.branchId);

  return {
    newContribution,
    contributionTransaction,
  };
};

/**
 * Make a sb transfer
 * @param {Object} withdrawal - Withdrawal details
 * @returns {Promise<Object>} Withdrawal details
 */
const makeSbTransfer = async (withdrawal) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const SbPackageModel = await SbPackage();
    const userPackage = await SbPackageModel.findOne(
      {
        accountNumber: withdrawal.accountNumber,
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
      narration: `SB transfer`,
    };

    await makeCustomerDeposit(withdrawalDetails, session);

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

/**
 * Merge savings packages into a single package
 * @param {string} targetPackageId - ID of the package to merge contributions into
 * @param {Array<string>} sourcePackageIds - Array of package IDs to be merged (excluding the target package)
 * @returns {Promise<Object>} Result of the operation
 */
const mergeSavingsPackages = async (targetPackageId, sourcePackageIds) => {
  const AccountTransactionModel = await AccountTransaction();
  const SbPackageModel = await SbPackage();
  const ContributionModel = await Contribution();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch and validate the packages to be merged
    const targetPackage = await SbPackageModel.findById(targetPackageId).session(session);
    if (!targetPackage || targetPackage.status !== 'open') {
      throw new ApiError(404, 'Target package is not valid.');
    }
    const userAccount = await getAccountByNumber(targetPackage.accountNumber);

    const sourcePackages = await SbPackageModel.find({
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
      await ContributionModel.updateMany({ packageId: sourcePackage._id }, { packageId: targetPackage._id }, { session });
    }

    // Save the updated totalContribution to the database
    await targetPackage.save();

    // Create an AccountTransaction for the merge
    const currentDate = new Date().getTime();

    await AccountTransactionModel.create({
      accountNumber: targetPackage.accountNumber,
      amount: targetPackage.totalContribution,
      createdBy: targetPackage.userId,
      branchId: userAccount.branchId,
      date: currentDate,
      direction: 'inflow',
      narration: 'Savings packages merged',
      userId: userAccount.userId,
    });

    // Close the source packages
    await SbPackageModel.updateMany({ _id: { $in: sourcePackageIds } }, { status: 'closed' }, { session });
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

const updatePackageProduct = async (packageId, newProductId) => {
  const ProductCatalogueModel = await ProductCatalogue();
  const SbPackageModel = await SbPackage();
  // Fetch the SB package
  const sbPackage = await SbPackageModel.findById(packageId);
  if (!sbPackage) {
    throw new ApiError(404, 'Package not found');
  }

  // Fetch the new product
  const newProduct = await ProductCatalogueModel.findById(newProductId);
  if (!newProduct || !newProduct.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }

  // Update the SB package with the new product
  sbPackage.product = newProductId;
  sbPackage.targetAmount = newProduct.sellingPrice;

  // Save the updated package
  const updatedPackage = await sbPackage.save();

  return updatedPackage;
};

/**
 * Get all sb packages. Filtering by branch and accountManagerId
 * @param {Object} filterOptions - Filtering options (branchId, accountManagerId)
 * @returns {Promise<Array>} Sb packages with additional information
 */
const getAllSbPackages = async (filterOptions) => {
  const SbPackageModel = await SbPackage();
  const { branchId, accountManagerId } = filterOptions;

  const query = {};

  if (branchId) {
    query.branchId = branchId;
  }

  if (accountManagerId) {
    query.accountManagerId = accountManagerId;
  }
  const packages = await SbPackageModel.find(query)
    .populate([
      {
        path: 'userId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
      {
        path: 'product',
        model: 'ProductCatalogue',
      },
      {
        path: 'accountManagerId',
        select: 'firstName lastName',
      },
    ])
    .exec();

  return packages;
};

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbTransfer,
  getPackageById,
  getUserSbPackages,
  mergeSavingsPackages,
  updatePackageProduct,
  getAllSbPackages,
};
