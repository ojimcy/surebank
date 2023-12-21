const httpStatus = require('http-status');
const { Expenditure, BranchStaff } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new expenditure
 * @param {Object} expenditureInput - Expenditure input data
 * @returns {Promise<Object>} The created expenditure object
 */
const createExpenditure = async (expenditureInput) => {
  const branch = await BranchStaff.findOne({ staffId: expenditureInput.createdBy });
  if (!branch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch not found for the given admin');
  }
  // Check if branch has a valid branchId before destructuring
  if (!branch.branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch does not have a valid branchId');
  }

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
 * @param {string} [branchId] - Optional branch ID to filter by
 * @param {string} [createdBy] - Optional createdBy to filter by
 * @returns {Promise<Object>} Paginated expenditures within the date range
 */
const getExpendituresByDateRange = async (startDate, endDate, page, limit, branchId, createdBy) => {
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

  // Optional branch filtering
  if (branchId) {
    query.branchId = branchId;
  }

  // Optional createdBy filtering
  if (createdBy) {
    query.createdBy = createdBy;
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
  const expenditure = await Expenditure.findById(expenditureId).populate('createdBy', 'firstName lastName');
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

/**
 * Approve an expenditure
 * @param {string} expenditureId - ID of the expenditure to be approved
 * @param {string} approvedBy - ID of the user who is approving the expenditure
 * @returns {Promise<Object>} The updated expenditure object
 */
const approveExpenditure = async (expenditureId, approvedBy) => {
  const expenditure = await getExpenditureById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }

  // Update the expenditure fields
  expenditure.status = 'approved';
  expenditure.approvedBy = approvedBy;

  await expenditure.save();
  return expenditure;
};

/**
 * Reject an expenditure
 * @param {string} expenditureId - ID of the expenditure to be rejected
 * @param {string} rejectedBy - ID of the user who is rejecting the expenditure
 * @param {string} reasonForRejection - Reason for rejecting the expenditure
 * @returns {Promise<Object>} The updated expenditure object
 */
const rejectExpenditure = async (expenditureId, rejectedBy, reasonForRejection) => {
  const expenditure = await Expenditure.findById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }
  expenditure.status = 'rejected';
  expenditure.rejectedBy = rejectedBy;
  expenditure.reasonForRejection = reasonForRejection;
  await expenditure.save();
  return expenditure;
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
  approveExpenditure,
  rejectExpenditure,
};
