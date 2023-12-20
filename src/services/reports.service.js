const httpStatus = require('http-status');
const { Contribution, AccountTransaction, Package, Charge } = require('../models');
const ApiError = require('../utils/ApiError');

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

/**
 * Retrieves the total contributions made by a specific user representative (userReps)
 * each day within a given date range.
 *
 * @param {string} createdBy - The ID of the user representative.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDateParam - The end date of the range.
 * @returns {Promise<Object>} An object containing the contributions per day and the sum total of all contributions.
 * @throws {ApiError} If there is an error retrieving the total contributions by day.
 */
const getTotalContributionsByUserReps = async (createdBy, startDate, endDateParam, limit = 10) => {
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
          createdBy,
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
          createdBy,
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

/**
 * Retrieves my total daily savings withdrawals
 *
 * @param {string} createdBy - The ID of the user representative.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDateParam - The end date of the range.
 * @param {number} limit - The maximum number of records to return.
 * @returns {Promise<Array>} Array of objects representing the total daily savings withdrawals for each day.
 * Each object has the following fields:
 * - date: The date for which the total withdrawals were calculated.
 * - total: The total amount of savings withdrawals made on that day.
 * @throws {ApiError} If there is an error retrieving the total daily withdrawals.
 */
const getMyDsWithdrawals = async (createdBy, startDate, endDateParam, limit = 10) => {
  try {
    // Set the endDate to the current date if not provided
    let endDate = endDateParam;
    if (!endDate) {
      endDate = new Date().getTime();
    }

    // Create a match object to filter based on userReps and date range
    const match = {
      createdBy,
      direction: 'inflow',
      narration: 'Daily contribution withdrawal',
    };

    // Apply date filtering if both startDate and endDate are provided
    if (startDate && endDateParam) {
      match.date = { $gte: startDate, $lte: endDate };
    }

    // Get the total daily savings withdrawals using aggregation
    const totalWithdrawals = await AccountTransaction.aggregate([
      { $match: match },
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
 * Get packages that have been charged (hasBeenCharged is true).
 * @returns {Promise<Array>} Array of packages that have been charged.
 * Each object represents a charged package with its details.
 */
const getChargedPackages = async () => {
  try {
    const chargedPackages = await Package.find({ hasBeenCharged: true }).populate([
      {
        path: 'userId',
        select: 'firstName lastName role',
      },
    ]);
    const totalAmountPerDay = chargedPackages.reduce((total, packages) => total + packages.amountPerDay, 0);

    return { chargedPackages, totalAmountPerDay };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get charged packages: ${error.message}`);
  }
};

/**
 * Get packages that have been charged (hasBeenCharged is true).
 * @returns {Promise<Array>} Array of packages that have been charged.
 * Each object represents a charged package with its details.
 */
const getChargedSbPackages = async () => {
  try {
    const chargedPackages = await Package.find({ hasBeenCharged: true }).populate([
      {
        path: 'userId',
        select: 'firstName lastName role',
      },
    ]);
    const totalAmountPerDay = chargedPackages.reduce((total, packages) => total + packages.amountPerDay, 0);

    return { chargedPackages, totalAmountPerDay };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, `Failed to get charged packages: ${error.message}`);
  }
};

/**
 * Get charges with optional filtering by date and branch
 * @param {Object} filterOptions - Filtering options (startDate, endDate, branchId)
 * @returns {Promise<Array>} Array of charges
 */
const getCharges = async (filterOpts, paginationOpts) => {
  const { startDate, endDate, branchId } = filterOpts;
  const { limit, page, sortBy } = paginationOpts;
  const skip = (page - 1) * limit;

  const query = {};

  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }

  if (branchId) {
    query.branchId = branchId;
  }

  const charges = await Charge.find(query)
    .populate([
      {
        path: 'userId',
        select: 'firstName lastName',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .exec();

  return charges;
};

/**
 * Get total amount with optional filtering by branch
 * @param {Object} branchId - Filtering options (branchId)
 * @returns {Promise<Number>} Total amount
 */
const getSumOfFirstContributions = async (branchId) => {
  const query = {};

  if (branchId) {
    query.branchId = branchId;
  }

  const totalAmountResult = await Charge.aggregate([
    { $match: query },
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]).exec();

  const totalCharge = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  return { totalCharge };
};

/**
 * Query for packages
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getPackages = async (filter, options) => {
  const packages = await Package.paginate(filter, options);
  return packages;
};

/**
 * Get the sum of daily contributions across all packages within a date range
 * @param {number} startDate - Timestamp representing the start date
 * @param {number} endDate - Timestamp representing the end date
 * @param {string} branchId - Branch ID (optional)
 * @param {string} createdBy - User ID (optional)
 * @returns {Promise<number>} Sum of daily contributions
 */
const getSumOfDailyContributionsByDate = async (startDate, endDate, branchId, createdBy) => {
  try {
    const query = {};
    if (startDate) query.date = { $gte: startDate };
    if (endDate) query.date = { ...query.date, $lte: endDate };
    if (branchId) query.branchId = branchId;
    if (createdBy) query.createdBy = createdBy;

    const contributions = await Contribution.find(query);
    const sumTotal = contributions.reduce((total, contribution) => total + contribution.amount, 0);
    return sumTotal;
  } catch (error) {
    throw new ApiError('Failed to get the sum of daily contributions', error);
  }
};

module.exports = {
  getTotalDailySavingsWithdrawal,
  getTotalContributionsByUserReps,
  getMyDsWithdrawals,
  getChargedPackages,
  getChargedSbPackages,
  getCharges,
  getSumOfFirstContributions,
  getPackages,
  getSumOfDailyContributionsByDate,
};
