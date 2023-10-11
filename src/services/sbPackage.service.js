const { startSession } = require('mongoose');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const { Product, SbPackage, Account, Contribution, AccountTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserByAccountNumber, makeCustomerDeposit } = require('./accountTransaction.service');
const { addLedgerEntry } = require('./accounting.service');

const createSbPackage = async (sbPackageData) => {
  const userAccount = await getUserByAccountNumber(sbPackageData.accountNumber);

  if (!userAccount) {
    throw new ApiError(404, 'Account number does not exist.');
  }

  const userPackageExist = await SbPackage.findOne({
    accountNumber: sbPackageData.accountNumber,
    status: 'open',
    product: sbPackageData.product,
  });

  if (userPackageExist) {
    throw new ApiError(400, 'Customer has an active package running');
  }

  const product = await Product.findById(sbPackageData.product);

  if (!product || !product.isSbAvailable) {
    throw new ApiError(400, 'The selected product is not available for Savings-Buying');
  }

  const amountPerDay = parseFloat((product.price / 31).toFixed(2));
  const startDate = new Date().getTime();

  const savingsBuyingPackage = await SbPackage.create({
    ...sbPackageData,
    targetAmount: product.price,
    image: product.images[0],
    amountPerDay,
    startDate,
  });

  return savingsBuyingPackage;
};

const makeDailyContribution = async (contributionInput, packageId) => {
  const userPackage = await SbPackage.findOne({ _id: packageId, status: 'open' });
  if (!userPackage) {
    throw new ApiError(400, 'Customer does not have an active package');
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

  const totalCount = userPackage.totalCount + contributionDaysCount;
  const totalContribution = userPackage.totalContribution + contributionInput.amount;

  if (totalContribution > userPackage.targetAmount) {
    throw new ApiError(400, 'Total contribution cannot exceed the target amount');
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
    count: contributionDaysCount,
    totalCount,
    date: currentDate,
    narration: `SB Daily contribution`,
  });

  userPackage.totalContribution = totalContribution;

  if (!userPackage.hasBeenCharged) {
    userPackage.totalContribution -= amountPerDay;

    await SbPackage.findByIdAndUpdate(userPackageId, {
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

  await SbPackage.findByIdAndUpdate(userPackageId, {
    totalContribution: userPackage.totalContribution,
  });

  await SbPackage.findByIdAndUpdate(userPackageId, {
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

    await SbPackage.findByIdAndUpdate(userPackageId, {
      status: 'closed',
      totalContribution: 0,
      totalCount: 0,
    });
  } else {
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
      throw new ApiError(404, 'User does not have an active daily savings package');
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

module.exports = {
  createSbPackage,
  makeDailyContribution,
  makeSbWithdrawal,
};
