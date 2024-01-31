/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');
const { Charge, Package, SbPackage, Account } = require('../models');
const { SMS_FFE } = require('../constants/account');
const { getUserByPhoneNumber } = require('./user.service');

/**
 * Save a charge and update the count in the associated package
 * @param {Object} chargeInput - Charge input
 * @returns {Promise<Object>} Result of the operation
 */
const chargeDsCustomer = async (chargeInput) => {
  const ChargeModel = await Charge();
  const PackageModel = await Package();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the package details to get the branchId
    const packageDetails = await PackageModel.findById(chargeInput.packageId);
    if (!packageDetails) {
      throw new Error('Package not found');
    }
    const currentDate = new Date().getTime();
    // Create a new charge
    const charge = await ChargeModel.create(
      [
        {
          branchId: packageDetails.branchId,
          userId: chargeInput.userId,
          date: currentDate,
          amount: chargeInput.amount,
          createdBy: chargeInput.createdBy,
          packageId: chargeInput.packageId,
          reasons: chargeInput.reasons,
        },
      ],
      { session }
    );

    await PackageModel.findByIdAndUpdate(
      chargeInput.packageId,
      {
        $inc: { totalContribution: -chargeInput.amount },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return charge;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Save a charge and update the count in the associated package
 * @param {Object} chargeInput - Charge input
 * @returns {Promise<Object>} Result of the operation
 */
const chargeSbCustomer = async (chargeInput) => {
  const ChargeModel = await Charge();
  const PackageModel = await SbPackage();
  const AccountModel = await Account();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the package details to get the branchId
    const packageDetails = await PackageModel.findById(chargeInput.packageId);

    if (!packageDetails) {
      throw new Error('Package not found');
    }
    const { accountNumber } = packageDetails;
    const account = await AccountModel.findOne({ accountNumber });

    const currentDate = new Date().getTime();
    // Create a new charge
    const charge = await ChargeModel.create(
      [
        {
          branchId: account.branchId,
          userId: chargeInput.userId,
          date: currentDate,
          amount: chargeInput.amount,
          createdBy: chargeInput.createdBy,
          packageId: chargeInput.packageId,
          reasons: chargeInput.reasons,
        },
      ],
      { session }
    );

    await PackageModel.findByIdAndUpdate(
      chargeInput.packageId,
      {
        $inc: { totalContribution: -chargeInput.amount },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return charge;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Charge SMS fees to a user
 * @param {string} phoneNumber - The phone number of the user
 * @param {string} createdBy - The ID of the user initiating the charge
 * @returns {Promise<Object>} - Result of the operation
 */
const chargeSmsFees = async (phoneNumber, numberOfSMS, createdBy, session) => {
  const ChargeModel = await Charge();
  // Get user information based on phone number
  const user = await getUserByPhoneNumber(phoneNumber);

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate total charge amount
  const smsChargedAmount = SMS_FFE * numberOfSMS;

  // Create a charge record
  const charge = await ChargeModel.create(
    [
      {
        userId: user._id,
        date: new Date().getTime(),
        amount: smsChargedAmount,
        createdBy,
        reasons: `SMS charge`,
      },
    ],
    { session }
  );

  return charge;
};

/**
 * Save SB profit and create a charge entry
 * @param {number} costPrice - The cost price of the product
 * @param {number} sellingPrice - The selling price of the product
 * @param {string} userId - The ID of the user initiating the charge
 * @returns {Promise<Object>} Result of the operation
 */
const saveSbProfit = async (costPrice, sellingPrice, userId, createdBy, branchId) => {
  const ChargeModel = await Charge();

  // Calculate profit
  const profit = sellingPrice - costPrice;
  // Create a charge record
  const charge = await ChargeModel.create({
    userId,
    date: new Date().getTime(),
    amount: profit,
    createdBy,
    branchId,
    reasons: 'Profit from SB',
  });
  return charge;
};

module.exports = {
  chargeDsCustomer,
  chargeSbCustomer,
  chargeSmsFees,
  saveSbProfit,
};
