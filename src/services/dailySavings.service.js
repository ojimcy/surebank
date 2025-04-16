const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { DsPackage, Contribution, AccountTransaction, Account, Charge, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getAccountByNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { getUserById } = require('./user.service');
const { CONTRIBUTION_CIRCLE, ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { addLedgerEntry } = require('./accounting.service');
const { dsContributionMessage, welcomeMessage } = require('../templates/sms/templates');
const { sendSms } = require('./sms.service');
const { getAccountByUserId } = require('./account.service');
const logger = require('../config/logger');
const { sendEmail } = require('./email.service');
const { sendNotification } = require('./notification.service');
const dailySavingsContributionTemplate = require('../templates/emails/daily-savings-contribution.template');

/**
 * Save a charge and update the count in the associated package
 * @param {Object} chargeInput - Charge input
 * @returns {Promise<Object>} Result of the operation
 */
const saveCharge = async (packageId, amount, createdBy, session) => {
  const PackageModel = await DsPackage();
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
        reasons: 'DS charge',
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
  const PackageModel = await DsPackage();
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

  const phone = userAccount.phoneNumber;
  const message = welcomeMessage(userAccount.firstName, userAccount.accountNumber);
  await sendSms(phone, message);

  return createdPackage;
};

/**
 * Save a daily contribution
 * @param {Object} contributionInput - Contribution input
 * @returns {Promise<Object>} Result of the operation
 */
const saveDailyContribution = async (contributionInput) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const PackageModel = await DsPackage();
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

    // Update total contribution and charge SMS fees atomically
    userPackage.totalContribution += contributionInput.amount;
    // Deduct SMS_FFE from contribution amount

    // const netContributionAmount = contributionInput.amount - SMS_FFE;
    await PackageModel.findByIdAndUpdate(
      userPackageId,
      {
        $set: { totalCount },
        $inc: { totalContribution: contributionInput.amount },
      },
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
    // await chargeSmsFees(userAccount.phoneNumber, 1, contributionInput.createdBy, branch.branchId);

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
  const PackageModel = await DsPackage();
  const session = await mongoose.startSession();
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
  const PackageModel = await DsPackage();
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
  const PackageModel = await DsPackage();
  const userPackages = await PackageModel.find({
    userId,
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

/**
 * Update package by id
 * @param {ObjectId} packageId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updatePackageById = async (packageId, updateBody) => {
  const PackageModel = await DsPackage();
  const dsPackage = await PackageModel.findById(packageId);
  if (!dsPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
  }

  Object.assign(dsPackage, updateBody);
  await dsPackage.save();
  return dsPackage;
};

/**
 * Get user's active daily savings package
 * @param {Object} query - Query parameters
 * @param {string} query.accountNumber - User's account number
 * @param {string} query.target - Savings target
 * @returns {Promise<Object>} User's active package
 */
const getUserPackage = async (query) => {
  const PackageModel = await DsPackage();

  const userPackage = await PackageModel.findOne({
    accountNumber: query.accountNumber,
    status: 'open',
    target: query.target,
  })
    .populate('createdBy', 'firstName lastName')
    .lean();

  return userPackage;
};

/**
 * Fallback method to send notifications directly if the notification service fails
 * @param {Object} notificationData - Data needed for notifications
 * @returns {Promise<void>}
 */
const sendDirectNotifications = async (notificationData) => {
  const { user, userAccount, packageData, amount, reference } = notificationData;

  try {
    // Check user notification preferences
    const notificationPreferences = user.notificationPreferences || {
      sms: true, // Default to true if not specified
      email: true, // Default to true if not specified
    };

    // Send SMS notification if enabled
    if (notificationPreferences.sms !== false && userAccount.phoneNumber) {
      const message = dsContributionMessage(
        user.firstName,
        amount,
        packageData.accountNumber,
        packageData.totalContribution,
        'Online Payment'
      );

      try {
        await sendSms(userAccount.phoneNumber, message);
        logger.info(`SMS notification sent for contribution ${reference} to ${userAccount.phoneNumber}`);
      } catch (smsError) {
        logger.error(`Failed to send SMS notification for contribution ${reference}:`, smsError);
        // Continue execution even if SMS fails
      }
    }

    // Send Email notification if enabled
    if (notificationPreferences.email !== false && user.email) {
      try {
        const emailData = {
          fullName: `${user.firstName} ${user.lastName}`,
          amount,
          accountNumber: packageData.accountNumber,
          totalContribution: packageData.totalContribution,
          reference,
          paymentMethod: 'Online Payment',
        };

        await sendEmail({
          to: user.email,
          subject: 'Daily Savings Contribution Confirmation',
          html: dailySavingsContributionTemplate(emailData),
        });

        logger.info(`Email notification sent for contribution ${reference} to ${user.email}`);
      } catch (emailError) {
        logger.error(`Failed to send email notification for contribution ${reference}:`, emailError);
        // Continue execution even if email fails
      }
    }
  } catch (error) {
    logger.error(`Error in fallback notifications for contribution ${reference}:`, error);
    // Don't throw the error as notifications are non-critical
  }
};

/**
 * Send notifications for a successful contribution based on user preferences
 * @param {Object} notificationData - Data needed for notifications
 * @returns {Promise<void>}
 */
const sendNotifications = async (notificationData) => {
  const { user, userAccount, packageData, amount, reference } = notificationData;

  try {
    // Store notification in database for user's inbox
    await sendNotification(user._id, 'account_activity', {
      email: user.email,
      phoneNumber: userAccount.phoneNumber,
      subject: 'Daily Savings Contribution Confirmation',
      message: dsContributionMessage(
        user.firstName,
        amount,
        packageData.accountNumber,
        packageData.totalContribution,
        'Online Payment'
      ),
      template: 'DAILY_SAVINGS_CONTRIBUTION',
      templateData: {
        fullName: `${user.firstName} ${user.lastName}`,
        amount,
        accountNumber: packageData.accountNumber,
        totalContribution: packageData.totalContribution,
        reference,
        paymentMethod: 'Online Payment',
      },
      reference,
      relatedEntityId: packageData._id,
      relatedEntityType: 'contribution',
    });

    logger.info(`Notification record created for contribution ${reference} for user ${user._id}`);
  } catch (error) {
    logger.error(`Error sending notifications for contribution ${reference}:`, error);
    // Fallback to direct notification if the notification service fails
    sendDirectNotifications(notificationData);
  }
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

  const PackageModel = await DsPackage();
  const ContributionModel = await Contribution();
  const AccountTransactionModel = await AccountTransaction();
  const UserModel = await User();

  // Variables to store notification data that will be used outside transaction
  let notificationData = null;

  try {
    // 1. Find the package
    const userPackage = await PackageModel.findById(packageId).session(session);
    if (!userPackage) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Daily Savings package not found');
    }
    if (userPackage.userId.toString() !== userId) {
      // Security check: ensure the user ID from metadata matches the package owner
      throw new ApiError(httpStatus.FORBIDDEN, 'User mismatch for package contribution');
    }
    if (userPackage.status === 'closed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot contribute to a closed package');
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
    const userAccount = await getAccountByUserId(userId);
    if (!userAccount) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User account details not found.');
    }

    // 4. Validate Amount (Optional - Paystack confirms amount, but we might have package rules)
    if (amount % userPackage.amountPerDay !== 0) {
      throw new ApiError(400, `Amount ${amount} is not valid for ${userPackage.amountPerDay} daily savings package`);
    }
    const contributionDaysCount = Math.round(amount / userPackage.amountPerDay); // Use Math.round for potential floating point issues
    if (contributionDaysCount <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Contribution amount is too small for the package daily amount.');
    }

    // 5. Create Contribution Record
    const totalCount = userPackage.totalCount + contributionDaysCount;
    const contributionDate = paymentDate || new Date(); // Use payment date from Paystack if available

    // Create contribution record but don't assign to variable since it's not used
    await ContributionModel.create(
      [
        {
          userId,
          amount,
          branchId: userPackage.branchId,
          accountNumber: userPackage.accountNumber,
          packageId,
          count: contributionDaysCount,
          totalCount,
          date: contributionDate,
          narration: `Daily contribution via Paystack`,
          paystackReference: reference,
          paymentMethod: 'paystack',
        },
      ],
      { session }
    );

    // 6. Handle Charges/Deductions
    let expectedDeduction = totalCount - (totalCount % CONTRIBUTION_CIRCLE);
    if (totalCount % CONTRIBUTION_CIRCLE > 0) {
      expectedDeduction += 1;
    }

    let chargeAmount = 0;
    if (userPackage.deductionCount < expectedDeduction) {
      chargeAmount = userPackage.amountPerDay;
      await saveCharge(packageId, chargeAmount, userId, session); // Assuming saveCharge is appropriate, pass userId
    }

    // 7. Create Account Transaction Record
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
          narration: `Daily contribution via Paystack (Ref: ${reference})`,
          paymentReference: reference,
          transactionType: 'contribution_ds_paystack',
          userId,
        },
      ],
      { session }
    );

    // 8. Update Package Totals
    await PackageModel.findByIdAndUpdate(
      packageId,
      {
        $set: { totalCount }, // Update the total count definitively
        $inc: {
          totalContribution: amount - chargeAmount,
          deductionCount: chargeAmount > 0 ? expectedDeduction - userPackage.deductionCount : 0,
          totalCharge: chargeAmount,
        },
      },
      { session }
    );

    // 9. Add Ledger Entry
    const addLedgerEntryInput = {
      type: ACCOUNT_TYPE[1], // DS Account
      direction: DIRECTION_VALUE[0], // Credit
      date: transactionDate,
      narration: `Daily contribution via Paystack (Ref: ${reference})`,
      amount,
      userId,
      branchId: userPackage.branchId,
      transactionId: contributionTransaction[0]._id,
      reference,
    };
    await addLedgerEntry(addLedgerEntryInput, session);

    // Store data for notifications after transaction completes
    const updatedPackage = await PackageModel.findById(packageId).session(session);
    const user = await UserModel.findById(userId).session(session);

    if (user && userAccount) {
      notificationData = {
        user,
        userAccount,
        packageData: {
          accountNumber: userPackage.accountNumber,
          totalContribution: updatedPackage.totalContribution,
        },
        amount,
        reference,
      };
    }

    // 11. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    logger.info(`Successfully processed Paystack contribution: Ref ${reference}, Package ${packageId}, Amount ${amount}`);

    // Send notifications outside of transaction
    if (notificationData) {
      await sendNotifications(notificationData);
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Error processing Paystack contribution Ref ${reference} for package ${packageId}:`, error);
    // Re-throw the error so verifyTransaction knows processing failed
    throw error;
  }
};

module.exports = {
  createDailySavingsPackage,
  saveDailyContribution,
  makeDailySavingsWithdrawal,
  getUserDailySavingsPackages,
  getDailySavingsContributions,
  getDailySavingsWithdrawals,
  getDailySavingsPackageById,
  updatePackageById,
  getUserPackage,
  processPaystackContribution,
  sendNotifications,
};
