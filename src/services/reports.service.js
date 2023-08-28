const httpStatus = require('http-status');
const { Contribution, AccountTransaction, Package, Account, BranchStaff } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Retrieves the total contributions made each day within a given date range.
 *
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Promise<Object>} An object containing the contributions per day and the sum total of all contributions.
 * @throws {ApiError} If there is an error retrieving the total contributions by day.
 */
const getTotalContributionsByDay = async (startDate, endDateParam, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }
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
      { $limit: parseInt(limit, 10) },
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
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get total contributions by day: ${error.message}`);
  }
};
const getBranchTotalContributionsByDay = async (startDate, endDateParam, branchAdmin, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }
    const branch = await BranchStaff.findOne({ staffId: branchAdmin });
    const branchId = branch.branchId;
    const matchStage = {
      date: { $gte: startDate, $lte: endDate },
      branchId: branchId, // Add the branchId filter
    };

    // Get the total contributions for each day using aggregation within the date range and branchId
    const contributionsPerDay = await Contribution.aggregate([
      {
        $match: matchStage,
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
      { $limit: parseInt(limit, 10) },
    ]);

    // Calculate the sum total of all contributions for the specified branchId
    const allContributions = await Contribution.aggregate([
      {
        $match: { branchId: branchId },
      },
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
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get total contributions by day: ${error.message}`);
  }
};

/**
 * Retrieves the total daily savings withdrawals made each day.
 * @returns {Promise<number>} Array of objects representing the total daily savings withdrawals for each day.
 * Each object has the following fields:
 * - date: The date for which the total withdrawals were calculated.
 * - total: The total amount of savings withdrawals made on that day.
 * @throws {Error} If there is an error retrieving the total daily withdrawals.
 */
const getTotalDailySavingsWithdrawal = async (startDate, endDateParam, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }
    // Get the total daily savings withdrawals for each day using aggregation
    const totalWithdrawals = await AccountTransaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
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
      { $limit: parseInt(limit, 10) },
    ]);

    return totalWithdrawals;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get total daily withdrawals by day: ${error.message}`);
  }
};
const getBranchTotalDailySavingsWithdrawal = async (startDate, endDateParam, branchAdmin, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }
    const branch = await BranchStaff.findOne({ staffId: branchAdmin });
    const branchId = branch.branchId;
    // Get the total daily savings withdrawals for each day using aggregation
    const totalWithdrawals = await AccountTransaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          branchId: branchId,
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
      { $limit: parseInt(limit, 10) },
    ]);

    return totalWithdrawals;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get total daily withdrawals by day: ${error.message}`);
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
const getBranchTotalOpenPackages = async (branchAdmin) => {
  const branch = await BranchStaff.findOne({ staffId: branchAdmin });
  // console.log(branch.branchId);
  const totalOpenPackages = await Package.countDocuments({ status: 'open', branchId: branch.branchId });
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
const getBranchTotalClosedPackages = async (branchAdmin) => {
  const branch = await BranchStaff.findOne({ staffId: branchAdmin });
  const totalClosedPackages = await Package.countDocuments({ status: 'closed', branchId: branch.branchId });
  return totalClosedPackages;
};

/**
 * Retrieves the total contributions made by a specific user representative (userReps)
 * each day within a given date range.
 *
 * @param {string} userReps - The ID of the user representative.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDateParam - The end date of the range.
 * @returns {Promise<Object>} An object containing the contributions per day and the sum total of all contributions.
 * @throws {ApiError} If there is an error retrieving the total contributions by day.
 */
const getTotalContributionsByUserReps = async (userReps, startDate, endDateParam, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }
    // Get the total contributions for each day by the specified user representative using aggregation within the date range
    const contributionsPerDay = await Contribution.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          userReps,
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
      { $limit: parseInt(limit, 10) },
    ]);
    // Calculate the sum total of all contributions
    const allContributions = await Contribution.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          userReps,
        },
      },
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
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get total contributions by user representative: ${error.message}`);
  }
};

module.exports = {
  getTotalContributionsByDay,
  getBranchTotalContributionsByDay,
  getTotalDailySavingsWithdrawal,
  getBranchTotalDailySavingsWithdrawal,
  getTotalPackages,
  getTotalOpenPackages,
  getBranchTotalOpenPackages,
  getTotalClosedPackages,
  getBranchTotalClosedPackages,
  getTotalContributionsByUserReps,
};
