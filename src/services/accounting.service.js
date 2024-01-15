const { Ledger, DailySummary, Expenditure, Package, BranchStaff } = require('../models');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');

/**
 * Add a ledger entry
 * @param {Object} addLedgerEntryInput - Ledger entry data
 * @returns {Promise<Object>} Result of the ledger entry operation
 */

const addLedgerEntry = async (addLedgerEntryInput, session) => {
  const { type } = addLedgerEntryInput;
  if (!ACCOUNT_TYPE.includes(type)) {
    return { success: false, data: null, message: 'Invalid account type' };
  }

  const { direction } = addLedgerEntryInput;
  if (!DIRECTION_VALUE.includes(direction)) {
    return { success: false, data: null, message: 'Invalid direction' };
  }

  const { amount } = addLedgerEntryInput;
  if (amount < 0) {
    return { success: false, data: null, message: 'Invalid amount' };
  }
  const createLedgerEntry = await Ledger.create([addLedgerEntryInput], { session });
  return createLedgerEntry;
};

/**
 * Query for ledger entries
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getLedgerEntries = async (filter, options) => {
  const ledgerEntries = await Ledger.paginate(filter, options);
  return ledgerEntries;
};

/**
 * Compute daily summary based on the provided currentDate
 * @param {Date} currentDate - The current date
 * @returns {Promise<Object>} Result of the daily summary computation
 */
const computeDailySummary = async (currentDate) => {
  const startDate = currentDate;
  const tDate = new Date();
  tDate.setDate(tDate.getDate() + 1);
  const endDate = new Date(tDate).getTime();

  const dailySummary = await Ledger.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$type',
        TotalAmount: {
          $sum: '$amount',
        },
      },
    },
  ]);

  const dataObj = {};
  dailySummary.forEach((datum) => {
    dataObj[datum._id] = datum.TotalAmount;
  });

  const now = new Date();
  const date = new Date(now).getTime();
  const createDailySummary = await DailySummary.create({ ...dataObj, date });

  return createDailySummary;
};

/**
 * Query for daily summary
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getDailySummary = async (filter, options) => {
  const dailySummary = await DailySummary.paginate(filter, options);
  return dailySummary;
};

/**
 * Get the sum of all first contributions (amounts that have been charged)
 * @returns {Promise<number>} The sum of all first contributions
 */
const getSumOfFirstContributions = async () => {
  const firstContributions = await Package.aggregate([
    {
      $match: {
        hasBeenCharged: true,
      },
    },
    {
      $group: {
        _id: null,
        totalFirstContributions: {
          $sum: '$amountPerDay',
        },
      },
    },
  ]);

  if (firstContributions.length > 0) {
    return firstContributions[0].totalFirstContributions;
  }

  return 0;
};

const getBranchSumOfFirstContributions = async (branchAdmin) => {
  const branch = await BranchStaff.findOne({ staffId: branchAdmin });
  const firstContributions = await Package.aggregate([
    {
      $match: {
        hasBeenCharged: true,
        branchId: branch.branchId,
      },
    },
    {
      $group: {
        _id: null,
        totalFirstContributions: {
          $sum: '$amountPerDay',
        },
      },
    },
  ]);

  if (firstContributions.length > 0) {
    return firstContributions[0].totalFirstContributions;
  }

  return 0;
};

/**
 * Get paginated expenditures by userReps
 * @param {string} userRepsId - ID of the userReps
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Paginated expenditures for the userReps
 */
const getExpendituresByUserReps = async (userRepsId, page, limit) => {
  const options = {
    page,
    limit,
    sort: { date: 'desc' },
  };

  const query = { userReps: userRepsId };

  const paginatedExpenditures = await Expenditure.paginate(query, options);
  return paginatedExpenditures;
};

module.exports = {
  addLedgerEntry,
  getLedgerEntries,
  computeDailySummary,
  getDailySummary,
  getSumOfFirstContributions,
  getExpendituresByUserReps,
  getBranchSumOfFirstContributions,
};
