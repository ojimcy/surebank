const httpStatus = require('http-status');
const logger = require('../config/logger');
const { Contribution, AccountTransaction, DsPackage, SbPackage, InterestPackage } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get dashboard summary for manager role
 * @param {Object} ContributionModel - Contribution model
 * @param {Object} AccountTransactionModel - AccountTransaction model
 * @param {Object} DsPackageModel - DsPackage model
 * @param {Object} SbPackageModel - SbPackage model
 * @param {Object} InterestPackageModel - InterestPackage model
 * @param {string} branchId - Branch ID
 * @param {string} managerId - Manager ID
 * @param {Object} dateFilter - Date filter object
 * @returns {Promise<Object>} Manager dashboard summary data
 */
const getManagerDashboardSummary = async (
  ContributionModel,
  AccountTransactionModel,
  DsPackageModel,
  SbPackageModel,
  InterestPackageModel,
  branchId,
  managerId,
  dateFilter
) => {
  // Branch level metrics
  const branchFilter = { branchId };

  // Branch total contributions
  const branchTotalContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...branchFilter,
        ...dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Branch DS contributions
  const branchDsContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...branchFilter,
        ...dateFilter,
        narration: 'Daily contribution via Paystack',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Branch SB contributions
  const branchSbContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...branchFilter,
        ...dateFilter,
        narration: 'SB contribution via Paystack',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Branch pending withdrawals
  const branchPendingWithdrawals = await AccountTransactionModel.aggregate([
    {
      $match: {
        ...branchFilter,
        ...dateFilter,
        direction: 'outflow',
        status: 'pending',
        narration: {
          $in: [
            'Request cash',
            'Self withdrawal request - ds',
            'Self withdrawal request - sb',
            'Self withdrawal request - ibs',
          ],
        },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  // Manager-specific metrics
  const managerFilter = { createdBy: managerId };

  // Manager total contributions
  const managerTotalContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...managerFilter,
        ...dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Manager DS contributions
  const managerDsContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...managerFilter,
        ...dateFilter,
        narration: 'Daily contribution via Paystack',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Manager SB contributions
  const managerSbContributions = await ContributionModel.aggregate([
    {
      $match: {
        ...managerFilter,
        ...dateFilter,
        narration: 'SB contribution via Paystack',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Manager pending withdrawals
  const managerPendingWithdrawals = await AccountTransactionModel.aggregate([
    {
      $match: {
        ...managerFilter,
        ...dateFilter,
        direction: 'outflow',
        status: 'pending',
        narration: {
          $in: [
            'Request cash',
            'Self withdrawal request - ds',
            'Self withdrawal request - sb',
            'Self withdrawal request - ibs',
          ],
        },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  // Open package counts
  const openPackageCount = await DsPackageModel.countDocuments({
    ...branchFilter,
    status: 'open',
  });

  const openSbPackageCount = await SbPackageModel.countDocuments({
    ...branchFilter,
    status: 'open',
  });

  const openIbsPackageCount = await InterestPackageModel.countDocuments({
    ...branchFilter,
    status: 'active',
  });

  // Combine all metrics into summary object
  return {
    // Branch metrics
    branchTotalContributions:
      branchTotalContributions[0] && branchTotalContributions[0].total ? branchTotalContributions[0].total : 0,
    branchDsContributions: branchDsContributions[0] && branchDsContributions[0].total ? branchDsContributions[0].total : 0,
    branchSbContributions: branchSbContributions[0] && branchSbContributions[0].total ? branchSbContributions[0].total : 0,
    branchPendingWithdrawals: {
      total: branchPendingWithdrawals[0] && branchPendingWithdrawals[0].total ? branchPendingWithdrawals[0].total : 0,
      count: branchPendingWithdrawals[0] && branchPendingWithdrawals[0].count ? branchPendingWithdrawals[0].count : 0,
    },

    // Manager-specific metrics
    managerTotalContributions:
      managerTotalContributions[0] && managerTotalContributions[0].total ? managerTotalContributions[0].total : 0,
    managerDsContributions:
      managerDsContributions[0] && managerDsContributions[0].total ? managerDsContributions[0].total : 0,
    managerSbContributions:
      managerSbContributions[0] && managerSbContributions[0].total ? managerSbContributions[0].total : 0,
    managerPendingWithdrawals: {
      total: managerPendingWithdrawals[0] && managerPendingWithdrawals[0].total ? managerPendingWithdrawals[0].total : 0,
      count: managerPendingWithdrawals[0] && managerPendingWithdrawals[0].count ? managerPendingWithdrawals[0].count : 0,
    },

    // Package counts
    openPackageCount,
    openSbPackageCount,
    openIbsPackageCount,
  };
};

/**
 * Get dashboard summary based on user role
 * @param {string} role - User role
 * @param {string} branchId - Branch ID (optional)
 * @param {Object} options - Additional options
 * @param {string} options.userId - User ID for manager role
 * @param {number} options.startDate - Start date timestamp
 * @param {number} options.endDate - End date timestamp
 * @returns {Promise<Object>} Dashboard summary data
 */
const getDashboardSummary = async (role, branchId, options = {}) => {
  try {
    const ContributionModel = await Contribution();
    const AccountTransactionModel = await AccountTransaction();
    const DsPackageModel = await DsPackage();
    const SbPackageModel = await SbPackage();
    const InterestPackageModel = await InterestPackage();

    const summary = {};

    // Prepare filter based on branchId
    const branchFilter = branchId ? { branchId } : {};

    // Date filter for optional date range filtering
    const dateFilter = {};
    if (options.startDate && options.endDate) {
      dateFilter.date = { $gte: options.startDate, $lte: options.endDate };
    } else {
      // Default to current day if no date range is provided
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)).getTime();
      dateFilter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (role === 'manager' && options.userId) {
      // Manager dashboard summary - combines branch data and manager-specific data
      return getManagerDashboardSummary(
        ContributionModel,
        AccountTransactionModel,
        DsPackageModel,
        SbPackageModel,
        InterestPackageModel,
        branchId,
        options.userId,
        dateFilter
      );
    }

    // SB Net Balance (sum of all daily contributions minus withdrawals)
    const sbContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: 'SB contribution via Paystack',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const sbWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          narration: { $in: ['Request cash', 'Self withdrawal request - sb'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // DS Net Balance
    const dsContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: 'Daily contribution via Paystack',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const dsWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          narration: { $in: ['Request cash', 'Self withdrawal request - ds'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // IBS Net Balance
    const ibsContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: 'IBS Contribution',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const ibsWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          narration: { $in: ['IBS withdrawal', 'Self withdrawal request - ibs'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Daily totals
    const contributionsDailyTotal = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const dailySavingsWithdrawalsToday = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
          direction: 'outflow',
          narration: {
            $in: [
              'Request cash',
              'Self withdrawal request - ds',
              'Self withdrawal request - sb',
              'Self withdrawal request - ibs',
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    logger.info('checking dailySavingsWithdrawalsToday');
    logger.info('dailySavingsWithdrawalsToday', dailySavingsWithdrawalsToday);

    const sbDailyTotal = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
          narration: 'SB contribution via Paystack',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const dsDailyTotal = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
          narration: 'Daily contribution via Paystack',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Open package counts
    const openPackageCount = await DsPackageModel.countDocuments({
      ...branchFilter,
      status: 'open',
    });

    const openSbPackageCount = await SbPackageModel.countDocuments({
      ...branchFilter,
      status: 'open',
    });

    const openIbsPackageCount = await InterestPackageModel.countDocuments({
      ...branchFilter,
      status: 'active',
    });

    // Calculate total contributions (sum of all contributions minus withdrawals - net balance)
    const sbNetBalance =
      (sbContributions[0] && sbContributions[0].total ? sbContributions[0].total : 0) -
      (sbWithdrawals[0] && sbWithdrawals[0].total ? sbWithdrawals[0].total : 0);
    const dsNetBalance =
      (dsContributions[0] && dsContributions[0].total ? dsContributions[0].total : 0) -
      (dsWithdrawals[0] && dsWithdrawals[0].total ? dsWithdrawals[0].total : 0);
    const ibsNetBalance =
      (ibsContributions[0] && ibsContributions[0].total ? ibsContributions[0].total : 0) -
      (ibsWithdrawals[0] && ibsWithdrawals[0].total ? ibsWithdrawals[0].total : 0);
    const totalContributions = sbNetBalance + dsNetBalance + ibsNetBalance;

    // Set the values in the summary object
    summary.totalContributions = totalContributions;
    summary.sbNetBalance = sbNetBalance;
    summary.dsNetBalance = dsNetBalance;
    summary.ibsNetBalance = ibsNetBalance;
    summary.contributionsDailyTotal =
      contributionsDailyTotal[0] && contributionsDailyTotal[0].total ? contributionsDailyTotal[0].total : 0;
    summary.dailySavingsWithdrawals =
      dailySavingsWithdrawalsToday[0] && dailySavingsWithdrawalsToday[0].total ? dailySavingsWithdrawalsToday[0].total : 0;
    summary.sbDailyTotal = sbDailyTotal[0] && sbDailyTotal[0].total ? sbDailyTotal[0].total : 0;
    summary.dsDailyTotal = dsDailyTotal[0] && dsDailyTotal[0].total ? dsDailyTotal[0].total : 0;
    summary.openPackageCount = openPackageCount;
    summary.openSbPackageCount = openSbPackageCount;
    summary.openIbsPackageCount = openIbsPackageCount;

    return summary;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to get dashboard summary: ${error.message}`);
  }
};

module.exports = {
  getDashboardSummary,
};
