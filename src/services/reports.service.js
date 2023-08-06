const { Contribution, AccountTransaction, Package } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get total contributions made each day within a date range
 * @param {Date} startDate - Start date of the range
 * @param {Date} endDate - End date of the range
 * @returns {Promise<Array>} Array of total contributions for each day within the date range
 */
const getTotalContributionsByDay = async (startDate, endDate) => {
  try {
    // Get the total contributions for each day using aggregation within the date range
    const contributionsPerDay = await Contribution.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: '$date' } },
            month: { $month: { $toDate: '$date' } },
            day: { $dayOfMonth: { $toDate: '$date' } },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          total: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    // Calculate the sum total of all contributions
    const allContributions = await Contribution.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const sumTotal = allContributions.length > 0 ? allContributions[0].total : 0;

    return { contributionsPerDay, sumTotal };
  } catch (error) {
    throw new ApiError('Failed to get total contributions by day', error);
  }
};

/**
 * Get total daily savings withdrawals made each day
 * @returns {Promise<number>} Array of total daily savings withdrawals for each day
 */
const getTotalDailySavingsWithdrawal = async () => {
  try {
    // Get the total daily savings withdrawals for each day using aggregation
    const totalWithdrawals = await AccountTransaction.aggregate([
      {
        $match: {
          direction: 'inflow',
          narration: 'Daily contribution withdrawal',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: '$date' } },
            month: { $month: { $toDate: '$date' } },
            day: { $dayOfMonth: { $toDate: '$date' } },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          total: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    return totalWithdrawals;
  } catch (error) {
    throw new Error('Failed to get total daily withdrawals by day');
  }
};

/**
 * Get total number of packages
 * @returns {Promise<number>} Total number of packages
 */
const getTotalPackages = async () => {
  const totalPackages = await Package.countDocuments();
  return totalPackages;
};

/**
 * Get total number of open packages
 * @returns {Promise<number>} Total number of open packages
 */
const getTotalOpenPackages = async () => {
  const totalOpenPackages = await Package.countDocuments({ status: 'open' });
  return totalOpenPackages;
};

/**
 * Get total number of closed packages
 * @returns {Promise<number>} Total number of closed packages
 */
const getTotalClosedPackages = async () => {
  const totalClosedPackages = await Package.countDocuments({ status: 'closed' });
  return totalClosedPackages;
};

module.exports = {
  getTotalContributionsByDay,
  getTotalDailySavingsWithdrawal,
  getTotalPackages,
  getTotalOpenPackages,
  getTotalClosedPackages,
};
