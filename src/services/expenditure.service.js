const httpStatus = require('http-status');
const { Expenditure, BranchStaff } = require('../models');
const ApiError = require('../utils/ApiError');

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
  createExpenditure,
  getExpendituresByDateRange,
  getTotalExpenditure,
  getBranchTotalExpenditure,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getExpendituresByUserReps,
};
