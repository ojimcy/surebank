const httpStatus = require('http-status');
const { Contribution, AccountTransaction, DsPackage, SbPackage, InterestPackage, Order } = require('../models');
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
        narration: { $regex: /daily\s*contribution/i },
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
        narration: { $regex: /sb\s*contribution/i },
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
        narration: { $regex: /daily\s*contribution/i },
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
        narration: { $regex: /sb\s*contribution/i },
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
    // Branch metrics (using names expected by ManagerDashboard)
    contributionsDailyTotal:
      branchTotalContributions[0] && branchTotalContributions[0].total ? branchTotalContributions[0].total : 0,
    dsDailyTotal: branchDsContributions[0] && branchDsContributions[0].total ? branchDsContributions[0].total : 0,
    sbDailyTotal: branchSbContributions[0] && branchSbContributions[0].total ? branchSbContributions[0].total : 0,
    dailySavingsWithdrawals:
      branchPendingWithdrawals[0] && branchPendingWithdrawals[0].total ? branchPendingWithdrawals[0].total : 0,

    // Manager-specific metrics (using names expected by ManagerDashboard)
    managerTotal:
      managerTotalContributions[0] && managerTotalContributions[0].total ? managerTotalContributions[0].total : 0,
    managerDsTotal: managerDsContributions[0] && managerDsContributions[0].total ? managerDsContributions[0].total : 0,
    managerSbTotal: managerSbContributions[0] && managerSbContributions[0].total ? managerSbContributions[0].total : 0,
    managerWithdrawals:
      managerPendingWithdrawals[0] && managerPendingWithdrawals[0].total ? managerPendingWithdrawals[0].total : 0,

    // Package counts
    openPackageCount,
    openSbPackageCount,
    openIbsPackageCount,

    // Additional data for compatibility
    branchPendingWithdrawalsCount:
      branchPendingWithdrawals[0] && branchPendingWithdrawals[0].count ? branchPendingWithdrawals[0].count : 0,
    managerPendingWithdrawalsCount:
      managerPendingWithdrawals[0] && managerPendingWithdrawals[0].count ? managerPendingWithdrawals[0].count : 0,
  };
};

/**
 * Get dashboard summary for admin role
 * @param {Object} ContributionModel - Contribution model
 * @param {Object} AccountTransactionModel - AccountTransaction model
 * @param {string} branchId - Branch ID (optional)
 * @param {Object} dateFilter - Date filter object
 * @returns {Promise<Object>} Admin dashboard summary data
 */
const getAdminDashboardSummary = async (ContributionModel, AccountTransactionModel, branchId, dateFilter) => {
  // Admin filter (branch-specific if branchId provided)
  const adminFilter = branchId ? { branchId } : {};

  // Calculate yesterday's date filter for comparison
  const currentDate = new Date();
  const yesterdayStart = new Date(currentDate);
  yesterdayStart.setDate(currentDate.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(currentDate);
  yesterdayEnd.setDate(currentDate.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const yesterdayFilter = {
    date: { $gte: yesterdayStart.getTime(), $lte: yesterdayEnd.getTime() },
  };

  // Helper function to calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10; // Round to 1 decimal place
  };

  // Today's data - Total daily contributions
  const contributionsDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Yesterday's data - Total daily contributions
  const contributionsDailyTotalYesterday = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...yesterdayFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Today's DS daily contributions
  const dsDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...dateFilter,
        narration: { $regex: /daily\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Yesterday's DS daily contributions
  const dsDailyTotalYesterday = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...yesterdayFilter,
        narration: { $regex: /daily\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Today's SB daily contributions
  const sbDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...dateFilter,
        narration: { $regex: /sb\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Yesterday's SB daily contributions
  const sbDailyTotalYesterday = await ContributionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...yesterdayFilter,
        narration: { $regex: /sb\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Today's daily pending withdrawal requests
  const dailySavingsWithdrawals = await AccountTransactionModel.aggregate([
    {
      $match: {
        ...adminFilter,
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
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Yesterday's daily pending withdrawal requests
  const dailySavingsWithdrawalsYesterday = await AccountTransactionModel.aggregate([
    {
      $match: {
        ...adminFilter,
        ...yesterdayFilter,
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
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Extract values with fallback to 0
  const todayContributions =
    contributionsDailyTotal[0] && contributionsDailyTotal[0].total ? contributionsDailyTotal[0].total : 0;
  const yesterdayContributions =
    contributionsDailyTotalYesterday[0] && contributionsDailyTotalYesterday[0].total
      ? contributionsDailyTotalYesterday[0].total
      : 0;

  const todayDs = dsDailyTotal[0] && dsDailyTotal[0].total ? dsDailyTotal[0].total : 0;
  const yesterdayDs = dsDailyTotalYesterday[0] && dsDailyTotalYesterday[0].total ? dsDailyTotalYesterday[0].total : 0;

  const todaySb = sbDailyTotal[0] && sbDailyTotal[0].total ? sbDailyTotal[0].total : 0;
  const yesterdaySb = sbDailyTotalYesterday[0] && sbDailyTotalYesterday[0].total ? sbDailyTotalYesterday[0].total : 0;

  const todayWithdrawals =
    dailySavingsWithdrawals[0] && dailySavingsWithdrawals[0].total ? dailySavingsWithdrawals[0].total : 0;
  const yesterdayWithdrawals =
    dailySavingsWithdrawalsYesterday[0] && dailySavingsWithdrawalsYesterday[0].total
      ? dailySavingsWithdrawalsYesterday[0].total
      : 0;

  return {
    contributionsDailyTotal: todayContributions,
    contributionsDailyTotalChange: calculatePercentageChange(todayContributions, yesterdayContributions),

    dsDailyTotal: todayDs,
    dsDailyTotalChange: calculatePercentageChange(todayDs, yesterdayDs),

    sbDailyTotal: todaySb,
    sbDailyTotalChange: calculatePercentageChange(todaySb, yesterdaySb),

    dailySavingsWithdrawals: todayWithdrawals,
    dailySavingsWithdrawalsChange: calculatePercentageChange(todayWithdrawals, yesterdayWithdrawals),
  };
};

/**
 * Get dashboard summary for user rep role
 * @param {Object} ContributionModel - Contribution model
 * @param {Object} AccountTransactionModel - AccountTransaction model
 * @param {Object} DsPackageModel - DsPackage model
 * @param {Object} SbPackageModel - SbPackage model
 * @param {string} userRepId - User Rep ID
 * @param {Object} dateFilter - Date filter object
 * @returns {Promise<Object>} User rep dashboard summary data
 */
const getUserRepDashboardSummary = async (
  ContributionModel,
  AccountTransactionModel,
  DsPackageModel,
  SbPackageModel,
  userRepId,
  dateFilter
) => {
  // User rep filter
  const userRepFilter = { createdBy: userRepId };

  // Total daily contributions by user rep
  const contributionsDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
        ...dateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // DS daily contributions by user rep
  const dsDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
        ...dateFilter,
        narration: { $regex: /daily\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // SB daily contributions by user rep
  const sbDailyTotal = await ContributionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
        ...dateFilter,
        narration: { $regex: /sb\s*contribution/i },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Daily withdrawal requests by user rep
  const dailySavingsWithdrawals = await AccountTransactionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
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

  // Daily DS customers (unique packages with contributions today)
  const dailyDsCustomers = await ContributionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
        ...dateFilter,
        narration: { $regex: /daily\s*contribution/i },
      },
    },
    {
      $group: {
        _id: '$packageId',
      },
    },
    {
      $count: 'count',
    },
  ]);

  // Daily SB customers (unique packages with contributions today)
  const dailySbCustomers = await ContributionModel.aggregate([
    {
      $match: {
        ...userRepFilter,
        ...dateFilter,
        narration: { $regex: /sb\s*contribution/i },
      },
    },
    {
      $group: {
        _id: '$packageId',
      },
    },
    {
      $count: 'count',
    },
  ]);

  // Open package counts by user rep
  const openPackageCount = await DsPackageModel.countDocuments({
    ...userRepFilter,
    status: 'open',
  });

  const openSbPackageCount = await SbPackageModel.countDocuments({
    ...userRepFilter,
    status: 'open',
  });

  return {
    contributionsDailyTotal:
      contributionsDailyTotal[0] && contributionsDailyTotal[0].total ? contributionsDailyTotal[0].total : 0,
    dsDailyTotal: dsDailyTotal[0] && dsDailyTotal[0].total ? dsDailyTotal[0].total : 0,
    sbDailyTotal: sbDailyTotal[0] && sbDailyTotal[0].total ? sbDailyTotal[0].total : 0,
    dailySavingsWithdrawals:
      dailySavingsWithdrawals[0] && dailySavingsWithdrawals[0].total ? dailySavingsWithdrawals[0].total : 0,
    dailyDsCustomers: dailyDsCustomers[0] && dailyDsCustomers[0].count ? dailyDsCustomers[0].count : 0,
    dailySbCustomers: dailySbCustomers[0] && dailySbCustomers[0].count ? dailySbCustomers[0].count : 0,
    openPackageCount,
    openSbPackageCount,
    totalOpenPackages:
      (dailyDsCustomers[0] && dailyDsCustomers[0].count ? dailyDsCustomers[0].count : 0) +
      (dailySbCustomers[0] && dailySbCustomers[0].count ? dailySbCustomers[0].count : 0),
    totalPackages: openPackageCount + openSbPackageCount,
  };
};

/**
 * Get dashboard summary based on user role
 * @param {string} role - User role
 * @param {string} branchId - Branch ID (optional)
 * @param {Object} options - Additional options
 * @param {string} options.userId - User ID for manager/user_rep role
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
    const OrderModel = await Order();

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

    if (role === 'userReps' && options.userId) {
      // User rep dashboard summary - user rep specific data
      return getUserRepDashboardSummary(
        ContributionModel,
        AccountTransactionModel,
        DsPackageModel,
        SbPackageModel,
        options.userId,
        dateFilter
      );
    }

    if (role === 'admin') {
      // Admin dashboard summary - branch or system-wide data
      return getAdminDashboardSummary(ContributionModel, AccountTransactionModel, branchId, dateFilter);
    }

    // For superAdmin and other roles, continue with comprehensive dashboard summary
    // SB Net Balance (sum of all daily contributions minus withdrawals)
    const sbContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: { $regex: /sb\s*contribution/i },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const sbWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          status: 'approved',
          narration: { $in: ['Self withdrawal request - sb', 'Request Cash SB'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // SB Sales (paid orders)
    const sbSales = await OrderModel.aggregate([
      {
        $match: {
          ...branchFilter,
          status: 'paid',
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // DS Net Balance
    const dsContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: { $regex: /daily\s*contribution/i },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const dsWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          status: 'approved',
          narration: { $in: ['Request Cash', 'Self withdrawal request - ds', 'Request Cash DS'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // IBS Net Balance
    const ibsContributions = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          narration: { $regex: /IBS (Contribution|payment|via Paystack)/i },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const ibsWithdrawals = await AccountTransactionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          direction: 'outflow',
          narration: {
            $in: [
              'IBS withdrawal',
              'Self withdrawal request - ibs',
              'Interest package withdrawal: Mature withdrawal',
              'Interest package withdrawal: early withdrawal',
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Get the sum of principal amounts from active IBS packages
    const ibsPrincipal = await InterestPackageModel.aggregate([
      {
        $match: {
          ...branchFilter,
          status: { $in: ['active', 'matured'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$principalAmount' } } },
    ]);

    // Get the sum of accrued interest from active IBS packages
    const ibsInterest = await InterestPackageModel.aggregate([
      {
        $match: {
          ...branchFilter,
          status: { $in: ['active', 'matured'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$interestAccrued' } } },
    ]);

    // Calculate IBS balance based on actual package data
    const ibsPrincipalTotal = ibsPrincipal[0] && ibsPrincipal[0].total ? ibsPrincipal[0].total : 0;
    const ibsInterestTotal = ibsInterest[0] && ibsInterest[0].total ? ibsInterest[0].total : 0;
    const ibsWithdrawalsTotal = ibsWithdrawals[0] && ibsWithdrawals[0].total ? ibsWithdrawals[0].total : 0;

    // The actual amount still in the system is principal + interest - withdrawals
    const ibsNetBalance = ibsPrincipalTotal + ibsInterestTotal - ibsWithdrawalsTotal;

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

    const sbDailyTotal = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
          narration: { $regex: /sb\s*contribution/i },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const dsDailyTotal = await ContributionModel.aggregate([
      {
        $match: {
          ...branchFilter,
          ...dateFilter,
          narration: { $regex: /daily\s*contribution/i },
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
    // Calculate total contributions (sum of all contributions minus withdrawals and sales - net balance)
    console.log('sbContributions', sbContributions);
    console.log('sbWithdrawals', sbWithdrawals);
    console.log('sbSales', sbSales);
    const sbNetBalance =
      (sbContributions[0] && sbContributions[0].total ? sbContributions[0].total : 0) -
      (sbWithdrawals[0] && sbWithdrawals[0].total ? sbWithdrawals[0].total : 0) -
      (sbSales[0] && sbSales[0].total ? sbSales[0].total : 0);
    const dsNetBalance =
      (dsContributions[0] && dsContributions[0].total ? dsContributions[0].total : 0) -
      (dsWithdrawals[0] && dsWithdrawals[0].total ? dsWithdrawals[0].total : 0);
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
    summary.ibsPrincipalTotal = ibsPrincipalTotal;
    summary.ibsInterestTotal = ibsInterestTotal;
    summary.ibsWithdrawalsTotal = ibsWithdrawalsTotal;
    summary.sbSalesTotal = sbSales[0] && sbSales[0].total ? sbSales[0].total : 0;

    return summary;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to get dashboard summary: ${error.message}`);
  }
};

module.exports = {
  getDashboardSummary,
};
