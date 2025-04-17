const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { InterestPackage, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserAccount } = require('./account.service');
const logger = require('../config/logger');
const { sendNotification } = require('./notification.service');
const paymentService = require('./payment.service');

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

  const interestPackage = await InterestPackageModel.findById(packageId);
  if (!interestPackage || interestPackage.status !== 'active') {
    return interestPackage;
  }

  const now = new Date();
  const lastCalculation = new Date(interestPackage.lastInterestCalculationDate);

  // If maturity date has been reached, update status to matured
  if (now >= interestPackage.maturityDate && interestPackage.status === 'active') {
    await updatePackageStatus(packageId, 'matured');

    // Send notification to user about maturity
    try {
      await sendNotification({
        title: 'Interest Package Matured',
        message: `Your Interest-Based Savings package "${interestPackage.name}" has matured.`,
        userId: interestPackage.userId,
        type: 'package',
      });
    } catch (error) {
      logger.error('Error sending maturity notification:', error);
    }
  }

  // Calculate time difference in days since last calculation
  const timeDiffMs = now.getTime() - lastCalculation.getTime();
  const daysSinceLastCalc = timeDiffMs / (24 * 60 * 60 * 1000);

  // If less than a day has passed since last calculation, return the package as is
  if (daysSinceLastCalc < 1) {
    return interestPackage;
  }

  // Use simple interest calculation (no compounding)
  // Simple Interest = Principal × Rate × Time
  const interestRate = interestPackage.interestRate / 100; // Convert percentage to decimal
  const dailyRate = interestRate / 365; // Convert annual rate to daily rate
  const interestAmount = interestPackage.currentBalance * dailyRate * Math.floor(daysSinceLastCalc); // Only count full days

  // Round to 2 decimal places
  const roundedInterestAmount = Math.round(interestAmount * 100) / 100;

  // Update package with new interest accrued and last calculation date
  const updatedPackage = await InterestPackageModel.findByIdAndUpdate(
    packageId,
    {
      $inc: {
        interestAccrued: roundedInterestAmount,
        currentBalance: roundedInterestAmount, // This adds the interest to the current balance as well
      },
      $set: { lastInterestCalculationDate: now },
    },
    { new: true }
  );

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

  // Create a working copy of the package data to avoid modifying the input parameter
  let packageData = { ...packageDataInput };

  // If payment reference is provided, verify the payment first
  if (paymentReference) {
    try {
      const verification = await paymentService.verifyTransaction(paymentReference);

      if (!verification || !verification.verified) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed. Package cannot be created.');
      }

      // Extract package data from payment metadata if not directly provided
      if (verification.transactionData.metadata && verification.transactionData.metadata.isPackagePending) {
        const { metadata } = verification.transactionData;

        // Merge metadata values when not provided in original input
        packageData = {
          ...packageData,
          principalAmount: packageData.principalAmount || metadata.principalAmount,
          interestRate: packageData.interestRate || metadata.interestRate,
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
    // If no payment reference and not admin-created, we require payment first
    throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Payment is required before creating an interest package.');
  }

  // Get user's account from userId
  const userAccount = await getUserAccount(packageData.userId, 'ibs');
  if (!userAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found. Please create one to continue.');
  }

  // Calculate maturity date based on lock period
  const startDate = new Date();
  const maturityDate = new Date(startDate);
  maturityDate.setDate(maturityDate.getDate() + packageData.lockPeriod);

  // Create the package
  const interestPackage = await InterestPackageModel.create({
    ...packageData,
    accountNumber: userAccount.accountNumber,
    startDate,
    maturityDate,
    currentBalance: packageData.principalAmount, // Initially set to principal amount
    status: 'active',
    paymentReference, // Store the payment reference
  });

  try {
    // Send notification
    await sendNotification({
      title: 'Interest Package Created',
      message: `Your Interest-Based Savings package has been created successfully. It will mature on ${maturityDate.toLocaleDateString()}.`,
      userId: packageData.userId,
      type: 'package',
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    // Continue execution even if notification fails
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
      await sendNotification({
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request for package "${interestPackage.name}" has been submitted and is pending approval.`,
        userId: interestPackage.userId,
        type: 'package',
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
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed');
    }

    const { metadata } = verification.transactionData;

    // Check if this is for interest package and package is pending creation
    if (metadata && metadata.contributionType === 'interest_savings' && metadata.isPackagePending) {
      // Create the package with data from payment metadata
      const packageData = {
        userId: metadata.userId,
        principalAmount: metadata.principalAmount,
        interestRate: metadata.interestRate,
        lockPeriod: metadata.lockPeriod,
        name: metadata.name,
        earlyWithdrawalPenalty: metadata.earlyWithdrawalPenalty,
        createdBy: metadata.userId, // User creating their own package
      };

      return await createInterestPackage(packageData, paymentData.reference);
    }

    return { message: 'Payment verified but no pending interest package found' };
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
};
