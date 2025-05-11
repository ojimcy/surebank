const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { InterestPackage, AccountTransaction, PaymentTransaction, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserAccount } = require('./account.service');
const logger = require('../config/logger');
const { sendNotification, getUserNotificationPreference } = require('./notification.service');
const paymentService = require('./payment.service');
const emailService = require('./email.service');

const interestRateConfig = require('../config/interestRates');
const { sendSMS } = require('./sms.service');

/**
 * Update package status
 * @param {string} packageId - Package ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated package
 */
const updatePackageStatus = async (packageId, newStatus) => {
  const InterestPackageModel = await InterestPackage();

  const validStatuses = ['active', 'matured', 'closed', 'pending_withdrawal'];
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status');
  }

  const updatedPackage = await InterestPackageModel.findByIdAndUpdate(packageId, { status: newStatus }, { new: true });

  if (!updatedPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found');
  }

  return updatedPackage;
};

/**
 * Calculate interest for a specific package
 * @param {string} packageId - Package ID
 * @returns {Promise<Object>} Updated package with calculated interest
 */
const calculateInterestForPackage = async (packageId) => {
  const InterestPackageModel = await InterestPackage();
  const UserModel = await User();

  // Get the interest package in a single operation
  const interestPackage = await InterestPackageModel.findById(packageId);

  // Return early if package doesn't exist or isn't active
  if (!interestPackage || interestPackage.status !== 'active') {
    return interestPackage;
  }

  const now = new Date().getTime();
  const lastCalculation = interestPackage.lastInterestCalculationDate;

  // Calculate time difference in days since last calculation
  const timeDiffMs = now - lastCalculation;
  const daysSinceLastCalc = timeDiffMs / (24 * 60 * 60 * 1000);
  const fullDays = Math.floor(daysSinceLastCalc);

  // Return early if less than a day has passed since last calculation
  if (fullDays < 1) {
    return interestPackage;
  }

  // Check for maturity
  const isMatured = now >= interestPackage.maturityDate;
  let updateData = {};

  // Only calculate interest if package has been active for at least a day
  // Simple Interest = Principal × Rate × Time
  const interestRate = interestPackage.interestRate / 100; // Convert percentage to decimal
  const dailyRate = interestRate / 365; // Convert annual rate to daily rate
  const interestAmount = interestPackage.currentBalance * dailyRate * fullDays;

  // Round to 2 decimal places
  const roundedInterestAmount = Math.round(interestAmount * 100) / 100;

  // Prepare update data
  updateData = {
    $inc: {
      interestAccrued: roundedInterestAmount,
      currentBalance: roundedInterestAmount,
    },
    $set: {
      lastInterestCalculationDate: now,
    },
  };

  // If matured, update status in the same operation
  if (isMatured && interestPackage.status === 'active') {
    updateData.$set.status = 'matured';
  }

  // Update package with new interest accrued and last calculation date
  // In a single database operation
  const updatedPackage = await InterestPackageModel.findByIdAndUpdate(packageId, updateData, { new: true });

  // Send notification about maturity if needed
  if (isMatured && interestPackage.status === 'active') {
    try {
      // Get user's email for notification
      const user = await UserModel.findById(interestPackage.userId);
      const userEmail = user ? user.email : null;
      const phoneNumber = user ? user.phoneNumber : null;

      // Create in-app notification
      await sendNotification(interestPackage.userId, 'package_matured', {
        title: 'Interest Package Matured',
        body: `Your Interest-Based Savings package "${interestPackage.name}" has matured.`,
        reference: interestPackage._id.toString(),
        relatedEntityId: interestPackage._id,
        relatedEntityType: 'interest_package',
      });

      // Send email notification if user has email
      if (userEmail) {
        const emailPreference = await getUserNotificationPreference(interestPackage.userId, 'package_matured');
        if (emailPreference === 'email' || emailPreference === 'both') {
          await emailService.sendEmail({
            to: userEmail,
            subject: 'Package Maturity Alert',
            template: 'PACKAGE_MATURITY_ALERT',
            templateData: {
              name: user && user.firstName ? user.firstName : 'Valued Customer',
              packageName: interestPackage.name,
              interestRate: interestPackage.interestRate,
              maturityDate: new Date(interestPackage.maturityDate).toLocaleDateString(),
              amount: interestPackage.currentBalance,
              dashboardUrl: `${process.env.FRONTEND_URL}/packages/${interestPackage._id}`,
            },
          });
        }
      }

      // Send SMS notification if user has phone number
      if (phoneNumber) {
        const smsPreference = await getUserNotificationPreference(interestPackage.userId, 'package_matured');
        if (smsPreference === 'sms' || smsPreference === 'both') {
          const message = `Your Investment Package "${
            interestPackage.name
          }" has matured with a total amount of ${interestPackage.currentBalance.toFixed(2)}. Login to withdraw your funds.`;
          await sendSMS({
            to: phoneNumber,
            message,
          });
        }
      }
    } catch (error) {
      logger.error('Error sending maturity notification:', error);
      // Continue execution even if notification fails
    }
  }

  return updatedPackage;
};

/**
 * Create an interest-based savings package
 * @param {Object} packageData - Interest package input data
 * @param {string} [paymentReference] - Payment reference for verified payment
 * @returns {Promise<Object>} Created interest package
 */
const createInterestPackage = async (packageDataInput, paymentReference = null) => {
  const InterestPackageModel = await InterestPackage();

  // Create a working copy of the package data
  let packageData = { ...packageDataInput };

  // Validate payment or admin permission
  if (paymentReference) {
    try {
      const verification = await paymentService.verifyTransaction(paymentReference);

      if (!verification || !verification.verified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed. Package cannot be created.');
      }

      // Extract package data from payment metadata if available
      if (verification.transactionData.metadata && verification.transactionData.metadata.isPackagePending) {
        const { metadata } = verification.transactionData;

        // Use metadata as fallback values
        packageData = {
          ...packageData,
          principalAmount: packageData.principalAmount || metadata.principalAmount,
          lockPeriod: packageData.lockPeriod || metadata.lockPeriod,
          name: packageData.name || metadata.name,
          earlyWithdrawalPenalty: packageData.earlyWithdrawalPenalty || metadata.earlyWithdrawalPenalty,
        };
      }
    } catch (error) {
      logger.error('Payment verification error:', error);
      throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Payment could not be verified. Please try again or contact support.');
    }
  } else if (!packageData.isAdminCreated) {
    // Only admin can create packages without payment
    throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Payment is required before creating an interest package.');
  }

  // Determine the appropriate interest rate based on lock period
  const interestRateInfo = interestRateConfig.getInterestRateByLockPeriod(packageData.lockPeriod);

  if (!interestRateInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid lock period. Must be between ${interestRateConfig.ALLOWED_INTEREST_RATES[0].minLockPeriod} and ${
        interestRateConfig.ALLOWED_INTEREST_RATES[interestRateConfig.ALLOWED_INTEREST_RATES.length - 1].maxLockPeriod
      } days`
    );
  }

  // Set the interest rate from configuration (overriding any user input)
  packageData.interestRate = interestRateInfo.rate;
  packageData.interestRateId = interestRateInfo.id;

  // Set default withdrawal penalty if not provided
  packageData.earlyWithdrawalPenalty =
    packageData.earlyWithdrawalPenalty || interestRateConfig.DEFAULT_EARLY_WITHDRAWAL_PENALTY;

  // Get user's account from userId
  const userAccount = await getUserAccount(packageData.userId, 'ibs');
  if (!userAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found. Please create one to continue.');
  }

  // Calculate maturity date based on lock period
  const startDate = new Date().getTime(); // Store as timestamp
  const lockPeriodInMs = packageData.lockPeriod * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const maturityDate = startDate + lockPeriodInMs; // Add lock period to timestamp

  // Prepare final package data with defaults for any missing values
  const finalPackageData = {
    ...packageData,
    accountNumber: userAccount.accountNumber,
    startDate,
    maturityDate,
    currentBalance: packageData.principalAmount,
    interestAccrued: 0,
    lastInterestCalculationDate: startDate,
    status: 'active',
    paymentReference,
  };

  // Create the package with all necessary data
  const interestPackage = await InterestPackageModel.create(finalPackageData);

  // Get user's email for notification
  const { email: userEmail, phoneNumber } = userAccount.userId;

  // Create in-app notification
  try {
    await sendNotification(packageData.userId, 'package_created', {
      title: `${interestRateInfo.name} Package Created`,
      body: `Your Interest-Based Savings package (${
        interestRateInfo.rate
      }% interest per annum) has been created successfully. It will mature on ${new Date(
        maturityDate
      ).toLocaleDateString()}.`,
      reference: interestPackage._id.toString(),
    });
  } catch (error) {
    logger.error('Error sending in-app notification:', error);
    // Notification failure doesn't block package creation
  }

  // Send email notification if user has email
  if (userEmail) {
    // Check user preference for this notification type
    try {
      const emailPreference = await getUserNotificationPreference(packageData.userId, 'package_created');
      if (emailPreference === 'email' || emailPreference === 'both') {
        await emailService.sendPackageCreationEmail(userEmail, {
          name: interestPackage.name || interestRateInfo.name,
          packageName: interestPackage.name || interestRateInfo.name,
          userName: userAccount.firstName || (userEmail ? userEmail.split('@')[0] : 'Valued Customer'),
          interestRate: interestRateInfo.rate,
          startDate,
          maturityDate,
          amount: packageData.principalAmount,
          dashboardUrl: `${process.env.FRONTEND_URL}/packages/${interestPackage._id}`,
          lockPeriod: packageData.lockPeriod,
        });
      }
    } catch (error) {
      logger.error('Error sending package creation email:', error);
    }
  }

  // Send SMS notification if user has phone number
  if (phoneNumber) {
    // Check user preference for this notification type
    try {
      const smsPreference = await getUserNotificationPreference(packageData.userId, 'package_created');
      if (smsPreference === 'sms' || smsPreference === 'both') {
        const message = `Your IBS Package (${interestRateInfo.rate}%) of ${
          packageData.principalAmount
        } has been created successfully. It will mature on ${new Date(maturityDate).toLocaleDateString()}.`;
        await sendSMS({
          to: phoneNumber,
          message,
        });
      }
    } catch (error) {
      logger.error('Error sending package creation SMS:', error);
    }
  }

  return interestPackage;
};

/**
 * Get interest package by id
 * @param {string} packageId - Package id
 * @returns {Promise<Object>} Interest package details
 */
const getInterestPackageById = async (packageId) => {
  const InterestPackageModel = await InterestPackage();

  // Calculate latest interest before returning package details
  await calculateInterestForPackage(packageId);

  const interestPackage = await InterestPackageModel.findById(packageId)
    .populate('createdBy', 'firstName lastName email')
    .lean();

  if (!interestPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found');
  }

  return interestPackage;
};

/**
 * Get interest package by payment reference
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Interest package details
 */
const getInterestPackageByReference = async (reference) => {
  const InterestPackageModel = await InterestPackage();

  // Check if reference starts with ibs_ prefix, which indicates it's an internal reference
  // and needs different handling than a payment reference
  let query = { paymentReference: reference };

  // If the reference has the ibs_ prefix, it might be a name rather than a payment reference
  if (reference.startsWith('ibs_')) {
    // Try to find by name as an alternative search
    query = {
      $or: [{ paymentReference: reference }, { name: reference }],
    };
  }

  const interestPackage = await InterestPackageModel.findOne(query).populate('createdBy', 'firstName lastName').lean();

  if (!interestPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found for this reference');
  }

  // Calculate latest interest before returning package details
  await calculateInterestForPackage(interestPackage._id);

  // Refresh package data after interest calculation
  const updatedPackage = await InterestPackageModel.findById(interestPackage._id)
    .populate('createdBy', 'firstName lastName')
    .lean();

  return updatedPackage;
};

/**
 * Get all interest packages for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of interest packages
 */
const getUserInterestPackages = async (userId) => {
  const InterestPackageModel = await InterestPackage();

  // Get all active packages for the user
  const packages = await InterestPackageModel.find({ userId })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  // Update interest for all active packages before returning
  await Promise.all(packages.filter((pkg) => pkg.status === 'active').map((pkg) => calculateInterestForPackage(pkg._id)));

  // Fetch updated packages
  const updatedPackages = await InterestPackageModel.find({ userId })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  return updatedPackages;
};

/**
 * Update interest for all active packages
 * @returns {Promise<number>} Number of packages updated
 */
const updateAllActivePackagesInterest = async () => {
  const InterestPackageModel = await InterestPackage();

  // Find all active packages
  const activePackages = await InterestPackageModel.find({ status: 'active' });

  // Update interest for each package
  const updatePromises = activePackages.map((pkg) => calculateInterestForPackage(pkg._id));
  const updatedPackages = await Promise.all(updatePromises);

  return updatedPackages.length;
};

/**
 * Calculate early withdrawal penalty
 * @param {string} packageId - Package ID
 * @returns {Promise<Object>} Withdrawal details with penalty calculation
 */
const calculateEarlyWithdrawalAmount = async (packageId) => {
  const InterestPackageModel = await InterestPackage();

  // First update the interest calculation to get the latest values
  await calculateInterestForPackage(packageId);

  const interestPackage = await InterestPackageModel.findById(packageId);
  if (!interestPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found');
  }

  // If package is already matured, no penalty applies
  if (interestPackage.status === 'matured') {
    return {
      packageId,
      originalBalance: interestPackage.principalAmount,
      interestAccrued: interestPackage.currentBalance - interestPackage.principalAmount,
      penaltyRate: 0,
      penaltyAmount: 0,
      totalWithdrawalAmount: interestPackage.currentBalance,
      isPenaltyApplied: false,
    };
  }

  // Calculate accrued interest
  const interestAccrued = interestPackage.currentBalance - interestPackage.principalAmount;

  // Calculate penalty amount (from accrued interest)
  const penaltyRate = interestPackage.earlyWithdrawalPenalty / 100;
  const penaltyAmount = interestAccrued * penaltyRate;

  // Calculate final withdrawal amount
  const totalWithdrawalAmount = interestPackage.principalAmount + (interestAccrued - penaltyAmount);

  return {
    packageId,
    originalBalance: interestPackage.principalAmount,
    interestAccrued,
    penaltyRate: interestPackage.earlyWithdrawalPenalty,
    penaltyAmount,
    totalWithdrawalAmount,
    isPenaltyApplied: true,
  };
};

/**
 * Process a withdrawal request for an interest package
 * Handles both early withdrawals and mature withdrawals intelligently
 * @param {string} packageId - Package ID
 * @param {string} withdrawalReason - Reason for withdrawal
 * @param {string} userId - User ID making the request
 * @returns {Promise<Object>} Withdrawal result
 */
const requestWithdrawal = async (packageId, withdrawalReason, userId) => {
  const InterestPackageModel = await InterestPackage();
  const AccountTransactionModel = await AccountTransaction();
  const UserModel = await User();

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First ensure interest is up to date
    await calculateInterestForPackage(packageId);

    // Get the package
    const interestPackage = await InterestPackageModel.findById(packageId).session(session);
    if (!interestPackage) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found');
    }

    // Verify user owns the package
    if (interestPackage.userId.toString() !== userId.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to withdraw from this package');
    }

    if (interestPackage.status === 'pending_withdrawal') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Package already has a pending withdrawal request');
    }

    if (interestPackage.status === 'closed') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Package is already closed');
    }

    // Determine if early withdrawal or regular (mature) withdrawal
    const isEarlyWithdrawal = interestPackage.status !== 'matured';

    // Calculate withdrawal details based on withdrawal type
    let withdrawalDetails;

    if (isEarlyWithdrawal) {
      // For early withdrawal - calculate accrued interest and apply penalty
      const interestAccrued = interestPackage.currentBalance - interestPackage.principalAmount;
      const penaltyRate = interestPackage.earlyWithdrawalPenalty / 100;
      const penaltyAmount = interestAccrued * penaltyRate;
      const totalWithdrawalAmount = interestPackage.principalAmount + (interestAccrued - penaltyAmount);

      withdrawalDetails = {
        packageId,
        originalBalance: interestPackage.principalAmount,
        interestAccrued,
        penaltyRate: interestPackage.earlyWithdrawalPenalty,
        penaltyAmount,
        totalWithdrawalAmount,
        isPenaltyApplied: true,
        isEarlyWithdrawal: true,
      };
    } else {
      // For mature withdrawal - no penalty applies
      withdrawalDetails = {
        packageId,
        originalBalance: interestPackage.principalAmount,
        interestAccrued: interestPackage.currentBalance - interestPackage.principalAmount,
        penaltyRate: 0,
        penaltyAmount: 0,
        totalWithdrawalAmount: interestPackage.currentBalance,
        isPenaltyApplied: false,
        isEarlyWithdrawal: false,
      };
    }

    // Update package status
    interestPackage.status = 'pending_withdrawal';
    await interestPackage.save({ session });

    // Create a withdrawal transaction record
    const transactionDate = new Date().getTime();
    const transactionData = {
      accountNumber: interestPackage.accountNumber,
      amount: withdrawalDetails.totalWithdrawalAmount,
      createdBy: userId,
      date: transactionDate,
      direction: 'outflow',
      narration: `Withdrawal from interest package: ${
        withdrawalReason || (isEarlyWithdrawal ? 'Early withdrawal' : 'Mature withdrawal')
      }`,
      packageId: interestPackage._id,
      userId: interestPackage.userId,
      branchId: interestPackage.branchId,
      isPenaltyApplied: withdrawalDetails.isPenaltyApplied,
      penaltyAmount: withdrawalDetails.penaltyAmount,
      withdrawalType: isEarlyWithdrawal ? 'early' : 'mature',
    };

    await AccountTransactionModel.create([transactionData], { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send notification
    try {
      // Get user's email for notification
      const user = await UserModel.findById(interestPackage.userId);
      const userEmail = user ? user.email : null;

      await sendNotification(interestPackage.userId, 'package_withdrawal_alert', {
        subject: 'Withdrawal Request Submitted',
        message: `Your withdrawal request for package "${interestPackage.name}" has been submitted and is pending approval.`,
        email: userEmail,
      });
    } catch (error) {
      logger.error('Error sending withdrawal notification:', error);
    }

    return {
      ...withdrawalDetails,
      status: 'pending_withdrawal',
      message: 'Withdrawal request submitted successfully and pending approval',
    };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get projected interest for a package
 * @param {string} packageId - Package ID
 * @param {number} days - Number of days to project into the future
 * @returns {Promise<Object>} Projected interest details
 */
const getProjectedInterest = async (packageId, days = 30) => {
  const InterestPackageModel = await InterestPackage();

  // First ensure current interest is up to date
  await calculateInterestForPackage(packageId);

  const interestPackage = await InterestPackageModel.findById(packageId);
  if (!interestPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interest package not found');
  }

  if (interestPackage.status !== 'active') {
    return {
      packageId,
      currentBalance: interestPackage.currentBalance,
      projectedBalance: interestPackage.currentBalance,
      projectedInterest: 0,
      daysProjected: 0,
      message: `Package is ${interestPackage.status}, no future interest will accrue.`,
    };
  }

  // Calculate simple interest for the projection period
  const dailyRate = interestPackage.interestRate / 100 / 365;
  const projectedInterest = interestPackage.currentBalance * dailyRate * days;
  const projectedBalance = interestPackage.currentBalance + projectedInterest;

  return {
    packageId,
    currentBalance: interestPackage.currentBalance,
    projectedBalance: Math.round(projectedBalance * 100) / 100,
    projectedInterest: Math.round(projectedInterest * 100) / 100,
    daysProjected: days,
    dailyInterestAmount: Math.round(interestPackage.currentBalance * dailyRate * 100) / 100,
  };
};

/**
 * Process callback from Paystack for interest package creation
 * @param {Object} paymentData - Payment data from webhook or callback
 * @returns {Promise<Object>} Created interest package
 */
const processVerifiedPayment = async (paymentData) => {
  if (!paymentData || !paymentData.reference) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment data');
  }

  try {
    // Verify the payment first
    const verification = await paymentService.verifyTransaction(paymentData.reference);

    if (!verification || !verification.verified) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed. Please try again or contact support.');
    }

    const { metadata } = verification.transactionData;

    // Check if this is for interest package and package is pending creation
    if (!metadata) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment metadata is missing. Cannot create package.');
    }

    if (metadata.contributionType !== 'interest_savings') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'This payment is not for an interest savings package.');
    }

    if (!metadata.isPackagePending) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'This payment is not for package creation or has already been processed.');
    }

    if (!metadata.userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User ID missing from payment data');
    }

    // Check if a package already exists with this payment reference to prevent duplicates
    const InterestPackageModel = await InterestPackage();
    const existingPackage = await InterestPackageModel.findOne({ paymentReference: paymentData.reference });

    if (existingPackage) {
      logger.info(`Package already exists for payment reference ${paymentData.reference}`);

      // If there's a redirect_url in the metadata, attach it to the existing package
      if (metadata.redirect_url) {
        existingPackage.redirect_url = metadata.redirect_url;
      }

      return existingPackage;
    }

    // Create the package data with required fields
    const packageData = {
      userId: metadata.userId,
      principalAmount: metadata.principalAmount,
      lockPeriod: metadata.lockPeriod,
      name: metadata.name || 'Interest Savings Package',
      earlyWithdrawalPenalty: metadata.earlyWithdrawalPenalty,
      createdBy: metadata.userId, // User creating their own package
    };

    // Mark the transaction as processed in our system
    try {
      const PaymentTransactionModel = await PaymentTransaction();
      await PaymentTransactionModel.updateOne(
        { reference: paymentData.reference },
        { $set: { status: 'processed', processedAt: new Date().getTime() } }
      );
    } catch (error) {
      logger.error('Error updating payment transaction status:', error);
      // Continue execution even if this fails
    }

    // Create the interest package
    const createdPackage = await createInterestPackage(packageData, paymentData.reference);

    // Attach the redirect_url from metadata if it exists (for frontend redirection)
    if (metadata.redirect_url) {
      createdPackage.redirect_url = metadata.redirect_url;
    }

    // Send notification asynchronously
    try {
      // Get user's email for notification
      const UserModel = await User();
      const user = await UserModel.findById(packageData.userId);
      const userEmail = user ? user.email : null;
      const phoneNumber = user ? user.phoneNumber : null;

      // Create in-app notification
      await sendNotification(packageData.userId, 'package_created', {
        title: 'Package Created Successfully',
        body: `Your deposit of ${packageData.principalAmount} was successful. Your interest-based savings package "${packageData.name}" is now active.`,
        reference: createdPackage._id.toString(),
        relatedEntityId: createdPackage._id,
        relatedEntityType: 'interest_package',
      });

      // Send email notification if user has email
      if (userEmail) {
        // Check user preference for this notification type
        const emailPreference = await getUserNotificationPreference(packageData.userId, 'package_created');
        if (emailPreference === 'email' || emailPreference === 'both') {
          await emailService.sendPackageCreationEmail(userEmail, {
            name: packageData.name,
            packageName: packageData.name,
            userName: user && user.firstName ? user.firstName : 'Valued Customer',
            interestRate: createdPackage.interestRate,
            startDate: createdPackage.startDate,
            maturityDate: createdPackage.maturityDate,
            amount: packageData.principalAmount,
            dashboardUrl: metadata.redirect_url || `${process.env.FRONTEND_URL}/packages/${createdPackage._id}`,
          });
        }
      }

      // Send SMS notification if user has phone number
      if (phoneNumber) {
        // Check user preference for this notification type
        const smsPreference = await getUserNotificationPreference(packageData.userId, 'package_created');
        if (smsPreference === 'sms' || smsPreference === 'both') {
          const message = `Your deposit of ${packageData.principalAmount} was successful. Your investment package "${packageData.name}" is now active.`;
          await sendSMS({
            to: phoneNumber,
            message,
          });
        }
      }
    } catch (error) {
      logger.error('Error sending package creation notification:', error);
      // Continue execution even if notification fails
    }

    return createdPackage;
  } catch (error) {
    logger.error('Error processing verified payment for interest package:', error);
    throw error;
  }
};

module.exports = {
  createInterestPackage,
  getInterestPackageById,
  getUserInterestPackages,
  calculateInterestForPackage,
  updateAllActivePackagesInterest,
  updatePackageStatus,
  calculateEarlyWithdrawalAmount,
  requestWithdrawal,
  getProjectedInterest,
  processVerifiedPayment,
  getInterestPackageByReference,
};
