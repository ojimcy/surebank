const httpStatus = require('http-status');
const { Ledger, DailySummary, Expenditure, Package, BranchStaff } = require('../models');
const { ACCOUNT_TYPE, DIRECTION_VALUE } = require('../constants/account');
const ApiError = require('../utils/ApiError');

/**
 * Add a ledger entry
 * @param {Object} addLedgerEntryInput - Ledger entry data
 * @returns {Promise<Object>} Result of the ledger entry operation
 */

const addLedgerEntry = async (addLedgerEntryInput) => {
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
  const createLedgerEntry = await Ledger.create(addLedgerEntryInput);
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
 * Create a new expenditure
 * @param {Object} expenditureInput - Expenditure input data
 * @returns {Promise<Object>} The created expenditure object
 */
const createExpenditure = async (expenditureInput) => {
  const branch = await BranchStaff.findOne({ staffId: expenditureInput.branchAdmin });
  const { branchId } = branch;
  const createdExpenditure = await Expenditure.create({ ...expenditureInput, branchId });
  return createdExpenditure;
};

/**
 * Get paginated expenditures over a date range
 * @param {Date} startDate - Start date for the range (optional)
 * @param {Date} endDate - End date for the range (optional)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Paginated expenditures within the date range
 */
const getExpendituresByDateRange = async (startDate, endDate, page, limit) => {
  const options = {
    page,
    limit,
    sort: { date: 'desc' }, // Sort by date in descending order
  };

  const query = {};

  if (startDate && endDate) {
    // If both startDate and endDate are provided, get expenditures within the date range
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    // If only startDate is provided, get expenditures starting from the startDate
    query.date = { $gte: startDate };
  } else if (endDate) {
    // If only endDate is provided, get expenditures up to the endDate
    query.date = { $lte: endDate };
  }

  const paginatedExpenditures = await Expenditure.paginate(query, options);
  return paginatedExpenditures;
};

/**
 * Get the totalExpenditure from all expenditures
 * @returns {Promise<number>} The totalExpenditure
 */
const getTotalExpenditure = async () => {
  const totalExpenditure = await Expenditure.aggregate([
    {
      $group: {
        _id: null,
        totalExpenditure: {
          $sum: '$amount',
        },
      },
    },
  ]);

  if (totalExpenditure.length > 0) {
    return totalExpenditure[0].totalExpenditure;
  }

  return 0;
};
const getBranchTotalExpenditure = async (branchAdmin) => {
  const branch = await BranchStaff.findOne({ staffId: branchAdmin });
  const totalExpenditure = await Expenditure.aggregate([
    {
      $match: {
        branchId: branch.branchId,
      },
    },
    {
      $group: {
        _id: null,
        totalExpenditure: {
          $sum: '$amount',
        },
      },
    },
  ]);

  if (totalExpenditure.length > 0) {
    return totalExpenditure[0].totalExpenditure;
  }

  return 0;
};

/**
 * Get a single expenditure by its ID
 * @param {string} expenditureId - ID of the expenditure
 * @returns {Promise<Object>} The found expenditure object
 */
const getExpenditureById = async (expenditureId) => {
  const expenditure = await Expenditure.findById(expenditureId).populate('userReps', 'firstName lastName');
  return expenditure;
};

/**
 * Update expenditure
 * @param {ObjectId} expenditureId
 * @param {Object} updateBody
 * @returns {Promise<Expenditure>}
 */
const updateExpenditure = async (expenditureId, updateBody) => {
  const expenditure = await getExpenditureById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }
  Object.assign(expenditure, updateBody);
  await expenditure.save();
  return expenditure;
};

/**
 * Delete expenditure by id
 * @param {ObjectId} expenditureId
 * @returns {Promise<Expenditure>}
 */
const deleteExpenditure = async (expenditureId) => {
  const expenditure = await getExpenditureById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }
  await expenditure.remove();
  return expenditure;
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
  createExpenditure,
  getExpendituresByDateRange,
  getTotalExpenditure,
  getBranchTotalExpenditure,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getSumOfFirstContributions,
  getExpendituresByUserReps,
  getBranchSumOfFirstContributions,
};
