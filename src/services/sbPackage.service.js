const mongoose = require('mongoose');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { SbPackage, Account, Contribution, AccountTransaction, ProductCatalogue, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getAccountByNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');
const { getProductCatalogueById } = require('./product.service');
const { sendSms } = require('./sms.service');
const { sbContributionMessage } = require('../templates/sms/templates');
const { getUserAccount } = require('./account.service');
const logger = require('../config/logger');
const { sendNotification } = require('./notification.service');
const config = require('../config/config');

const createSbPackage = async (sbPackageData) => {
  const SbPackageModel = await SbPackage();

  const userAccount = await getAccountByNumber(sbPackageData.accountNumber);

  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  if (userAccount.accountType !== 'sb') {
    throw new ApiError(404, 'Provide a valid SB account number');
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
 * Create a user-initiated SB package
 * @param {Object} sbPackageData - SB package input
 * @returns {Promise<Object>} Result of the operation
 */
const createUserInitiatedSbPackage = async (sbPackageData) => {
  const SbPackageModel = await SbPackage();

  // Get user's SB account from userId
  const userAccount = await getUserAccount(sbPackageData.userId, 'sb');
  if (!userAccount) {
    throw new ApiError(404, 'SB account not found. Please create one to continue.');
  }

  const { accountNumber } = userAccount;

  // Get product details
  const product = await getProductCatalogueById(sbPackageData.product);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }

  // Check if user already has an active package for the same product
  const userPackageExist = await SbPackageModel.findOne({
    accountNumber,
    status: 'open',
    product: sbPackageData.product,
  });

  if (userPackageExist) {
    throw new ApiError(400, 'You already have an active package running for this product');
  }

  // Create the package
  const startDate = new Date().getTime();
  const sbPackage = await SbPackageModel.create({
    accountNumber,
    product: sbPackageData.product,
    userId: sbPackageData.userId,
    createdBy: sbPackageData.createdBy,
    targetAmount: product.sellingPrice,
    image: product.images && product.images.length > 0 ? product.images[0] : null,
    branchId: userAccount.branchId,
    startDate,
    accountManagerId: userAccount.accountManagerId,
    status: 'open',
    totalContribution: 0,
  });

  // Send notification
  try {
    // Get user details to include email and phone number
    const UserModel = await User();
    const user = await UserModel.findById(sbPackageData.userId);

    if (user) {
      await sendNotification(sbPackageData.userId, 'package_created', {
        subject: 'Package Created Successfully',
        message: `Your SB package for "${product.name}" has been created successfully.`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        template: 'PACKAGE_CREATED',
        smsTemplate: 'package_created',
        relatedEntityId: sbPackage._id,
        relatedEntityType: 'package',
        templateData: {
          name: user.firstName || user.email.split('@')[0],
          productName: product.name,
          targetAmount: product.sellingPrice,
          currentContribution: 0,
          accountNumber,
          productImage: product.images && product.images.length > 0 ? product.images[0] : null,
          date: Date.now(),
          dashboardUrl: `${config.email.clientUrl}/dashboard/packages`,
        },
      });
    } else {
      logger.warn(`Could not send notification: User ${sbPackageData.userId} not found`);
    }
  } catch (error) {
    logger.error('Error sending notification:', { message: error.message });
    // Continue execution even if notification fails
  }

  return sbPackage;
};

/**
 * Make daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */
const makeDailyContribution = async (contributionInput) => {};

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
  createUserInitiatedSbPackage,
  makeDailyContribution,
  makeSbTransfer,
  getPackageById,
  getUserSbPackages,
  mergeSavingsPackages,
  updatePackageProduct,
  getAllSbPackages,
};
