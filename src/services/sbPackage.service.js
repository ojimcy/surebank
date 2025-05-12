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
const { sendMultiChannelNotification } = require('./notification.service');
const config = require('../config/config');

/**
 * Handle package creation notifications
 * @param {Object} params - Notification parameters
 * @returns {Promise<void>}
 */
const handlePackageCreatedNotification = async ({ user, data, notificationData }) => {
  const { productName, targetAmount, accountNumber } = data;

  try {
    // Prepare notification content for all channels
    const notificationContent = {
      inApp: {
        title: 'Package Created Successfully',
        body: `Your Savings-Buying package for ${productName} has been created successfully.`,
      },
      email: {
        template: 'PACKAGE_CREATION',
        templateData: {
          userName: user.firstName || user.email.split('@')[0],
          packageType: 'sb',
          targetAmount,
          productName,
          currentContribution: 0,
          accountNumber,
          date: Date.now(),
          dashboardUrl: `${config.paystack.frontendUrl}/dashboard/packages`,
        },
      },
      sms: `Your Savings-Buying package for ${productName} has been created successfully.`,
    };

    // Send notifications through all channels based on user preferences
    await sendMultiChannelNotification({
      userId: user._id,
      type: 'package_created',
      user,
      data,
      notificationContent,
      notificationData,
    });
  } catch (error) {
    logger.error('Error in package creation notification:', error);
  }
};

/**
 * Handle contribution notifications
 * @param {Object} params - Notification parameters
 * @returns {Promise<void>}
 */
const handleContributionNotification = async ({ user, data, notificationData, packageData, accountData }) => {
  const { amount, reference, accountNumber, paymentMethod = 'Online Payment' } = data;
  const totalContribution =
    packageData && packageData.totalContribution ? packageData.totalContribution : data.totalContribution;
  const productName = data.productName || (packageData && packageData.product ? packageData.product.name : 'your product');

  try {
    // Prepare notification content for all channels
    const notificationContent = {
      inApp: {
        title: 'SB Contribution',
        body: `Your SB contribution of ${amount} for ${productName} has been successfully processed.`,
      },
      email: {
        subject: 'SB Contribution Confirmation',
        template: 'CONTRIBUTION',
        templateData: {
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer',
          amount,
          packageType: 'sb',
          accountNumber: accountNumber || (packageData ? packageData.accountNumber : ''),
          contributionAmount: amount,
          totalContribution,
          reference,
          paymentMethod,
          productName,
          targetAmount: packageData && packageData.targetAmount ? packageData.targetAmount : 0,
          dashboardUrl: `${config.paystack.frontendUrl}/packages/${data.packageId}`,
        },
      },
      sms: sbContributionMessage(
        user.firstName || 'Valued Customer',
        amount,
        accountNumber || (packageData ? packageData.accountNumber : ''),
        totalContribution,
        paymentMethod
      ),
    };

    // Send notifications through all channels based on user preferences
    await sendMultiChannelNotification({
      userId: user._id,
      type: 'account_activities',
      user,
      data: { ...data, phoneNumber: accountData && accountData.phoneNumber }, // Pass accountData's phoneNumber for fallback
      notificationContent,
      notificationData,
    });

    logger.info(`All notifications sent for contribution ${reference} for user ${user._id}`);
  } catch (error) {
    logger.error(`Error in contribution notification:`, error);
  }
};

/**
 * Handle withdrawal notifications
 * @param {Object} params - Notification parameters
 * @returns {Promise<void>}
 */
const handleWithdrawalNotification = async ({ user, data, notificationData }) => {
  const { amount, accountNumber } = data;

  try {
    // Prepare notification content for all channels
    const notificationContent = {
      inApp: {
        title: 'Savings-Buying Withdrawal',
        body: `Your withdrawal of ${amount} from your Savings-Buying account has been processed.`,
      },
      email: {
        subject: 'Savings-Buying Withdrawal Confirmation',
        template: 'WITHDRAWAL_CONFIRMATION',
        templateData: {
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer',
          amount,
          accountNumber,
          date: new Date().toLocaleDateString(),
          dashboardUrl: `${config.email.clientUrl}/dashboard/savings-buying`,
        },
      },
      sms: `Your withdrawal of ${amount} from your Savings-Buying account (${accountNumber}) has been processed.`,
    };

    // Send notifications through all channels based on user preferences
    await sendMultiChannelNotification({
      userId: user._id,
      type: 'account_activities',
      user,
      data,
      notificationContent,
      notificationData,
    });
  } catch (error) {
    logger.error('Error in withdrawal notification:', error);
  }
};

/**
 * Send notifications for Savings-Buying operations based on notification type
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID
 * @param {string} params.notificationType - Type of notification (package_created, account_activity, withdrawal)
 * @param {Object} params.data - Data specific to the notification type
 * @param {Object} [params.user] - User object (optional, will be fetched if not provided)
 * @param {Object} [params.packageData] - Package data (optional)
 * @param {Object} [params.accountData] - Account data (optional)
 * @returns {Promise<void>}
 */
const sendSbNotifications = async ({ userId, notificationType, data, user, packageData, accountData }) => {
  if (!userId) {
    logger.error('sendSbNotifications called without userId');
    return;
  }

  try {
    // Fetch user if not provided
    let userToUse = user;
    if (!userToUse) {
      const UserModel = await User();
      const fetchedUser = await UserModel.findById(userId);
      if (!fetchedUser) {
        logger.warn(`Could not send notification: User ${userId} not found`);
        return;
      }
      userToUse = fetchedUser;
    }

    // Prepare common data
    const notificationData = {
      reference: data.reference,
      relatedEntityId: data.packageId || (packageData ? packageData._id : undefined),
      relatedEntityType: 'sb_package',
    };

    // Handle different notification types
    switch (notificationType) {
      case 'package_created':
        await handlePackageCreatedNotification({ user: userToUse, data, notificationData });
        break;
      case 'account_activities':
        await handleContributionNotification({ user: userToUse, data, notificationData, packageData, accountData });
        break;
      case 'withdrawal':
        await handleWithdrawalNotification({ user: userToUse, data, notificationData });
        break;
      default:
        logger.warn(`Unknown notification type: ${notificationType}`);
    }
  } catch (error) {
    logger.error(`Error sending Savings-Buying notification (${notificationType}):`, error);
    // Continue execution even if notification fails
  }
};

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

  // Send notification using the standardized notification function
  await sendSbNotifications({
    userId: sbPackageData.userId,
    notificationType: 'package_created',
    data: {
      productName: product.name,
      targetAmount: product.sellingPrice,
      accountNumber,
      packageId: sbPackage._id,
      reference: sbPackage._id.toString(),
    },
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
    packageId: userPackageId,
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

    // Send withdrawal notification using our standardized notification function
    if (userPackage.userId) {
      await sendSbNotifications({
        userId: userPackage.userId,
        notificationType: 'withdrawal',
        data: {
          amount: withdrawal.amount,
          accountNumber: withdrawal.accountNumber,
          reference: Date.now().toString(),
          packageId: userPackage._id,
        },
      });
    }

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
      packageId: targetPackage._id,
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

/**
 * Process a contribution received via Paystack
 * @param {string} packageId - The ID of the package to credit
 * @param {number} amount - The amount contributed (in Naira)
 * @param {string} userId - The ID of the user who made the contribution
 * @param {string} reference - The Paystack transaction reference
 * @param {Date} paymentDate - The date the payment was made
 * @returns {Promise<void>}
 */
const processPaystackContribution = async (packageId, amount, userId, reference, paymentDate) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const SbPackageModel = await SbPackage();
  const ContributionModel = await Contribution();
  const AccountTransactionModel = await AccountTransaction();

  try {
    // 1. Find the package
    const userPackage = await SbPackageModel.findById(packageId).session(session);
    if (!userPackage) {
      throw new ApiError(404, 'Savings-Buying package not found');
    }
    if (userPackage.userId.toString() !== userId) {
      // Security check: ensure the user ID from metadata matches the package owner
      throw new ApiError(403, 'User mismatch for package contribution');
    }
    if (userPackage.status === 'closed') {
      throw new ApiError(400, 'Cannot contribute to a closed package');
    }

    // 2. Check if this contribution reference has already been processed for this package
    const existingContribution = await ContributionModel.findOne({
      paystackReference: reference,
      packageId,
    }).session(session);
    if (existingContribution) {
      logger.warn(`Contribution with reference ${reference} already processed for package ${packageId}. Skipping.`);
      await session.abortTransaction();
      session.endSession();
      return; // Avoid duplicate processing
    }

    // 3. Find user account details
    const userAccount = await getUserAccount(userId, 'sb');
    if (!userAccount) {
      throw new ApiError(404, 'User account details not found.');
    }

    // 4. Create Contribution Record
    const contributionDate = paymentDate || new Date(); // Use payment date from Paystack if available

    // Create contribution record
    await ContributionModel.create(
      [
        {
          userId,
          amount,
          branchId: userPackage.branchId,
          accountNumber: userPackage.accountNumber,
          packageId,
          date: contributionDate,
          paymentMethod: 'paystack',
          narration: `SB contribution via Paystack`,
          paystackReference: reference,
          createdBy: userId,
        },
      ],
      { session }
    );

    // 5. Create Account Transaction Record
    const transactionDate = contributionDate;
    const contributionTransaction = await AccountTransactionModel.create(
      [
        {
          accountNumber: userPackage.accountNumber,
          amount,
          createdBy: userId,
          branchId: userPackage.branchId,
          date: transactionDate,
          direction: 'inflow',
          narration: `SB contribution via Paystack (Ref: ${reference})`,
          packageId,
          paymentReference: reference,
          transactionType: 'contribution_sb_paystack',
          userId,
        },
      ],
      { session }
    );

    // 6. Update Package Totals
    await SbPackageModel.findByIdAndUpdate(
      packageId,
      {
        $inc: { totalContribution: amount },
      },
      { session }
    );

    // 7. Add Ledger Entry
    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE[2], // SB Account
      direction: DIRECTION_VALUE[0], // Credit
      date: transactionDate,
      narration: `SB contribution via Paystack (Ref: ${reference})`,
      amount,
      userId,
      branchId: userPackage.branchId,
      transactionId: contributionTransaction[0]._id,
      reference,
    };
    await addLedgerEntry(addLedgerEntryInput, session);

    // Commit the transaction before sending notifications
    await session.commitTransaction();
    session.endSession();

    logger.info(`Successfully processed Paystack contribution: Ref ${reference}, Package ${packageId}, Amount ${amount}`);

    // Fetch complete product information for notifications
    const ProductCatalogueModel = await ProductCatalogue();
    const product = await ProductCatalogueModel.findById(userPackage.product);
    const productName = product ? product.name : 'your product';

    // 8. Send notification using our standardized notification function
    await sendSbNotifications({
      userId,
      notificationType: 'account_activities',
      data: {
        amount,
        reference,
        packageId,
        accountNumber: userPackage.accountNumber,
        totalContribution: userPackage.totalContribution + amount,
        paymentMethod: 'Online Payment',
        productName,
      },
      packageData: {
        ...userPackage.toObject(),
        product,
      },
      accountData: userAccount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Error processing Paystack contribution Ref ${reference} for package ${packageId}:`, error);
    // Re-throw the error so the caller knows processing failed
    throw error;
  }
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
  processPaystackContribution,
  sendSbNotifications,
};
