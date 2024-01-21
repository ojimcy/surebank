/* eslint-disable no-await-in-loop */
const { startSession } = require('mongoose');
const { Charge, Package, SbPackage } = require('../models');
const { getAccountByNumber } = require('./accountTransaction.service');

/**
 * Save a charge and update the count in the associated package
 * @param {Object} chargeInput - Charge input
 * @returns {Promise<Object>} Result of the operation
 */
const recordDsCharge = async (chargeInput) => {
  const ChargeModel = await Charge();
  const PackageModel = await Package();
  const session = await startSession();
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

    await Package.findByIdAndUpdate(
      chargeInput.packageId,
      {
        $inc: { totalContribution: chargeInput.amount },
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
const recordSbCharge = async (chargeInput) => {
  const ChargeModel = await Charge();
  const PackageModel = await SbPackage();
  const session = await startSession();
  session.startTransaction();

  try {
    // Fetch the package details to get the branchId
    const packageDetails = await PackageModel.findById(chargeInput.packageId);
    if (!packageDetails) {
      throw new Error('Package not found');
    }
    const account = await getAccountByNumber(packageDetails.accountNumber);

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

    await Package.findByIdAndUpdate(
      chargeInput.packageId,
      {
        $inc: { totalContribution: chargeInput.amount },
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

module.exports = {
  recordDsCharge,
  recordSbCharge,
};
