const httpStatus = require('http-status');
const { Expenditure, BranchStaff, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { validateRole } = require('./staff.service');

/**
 * Create a new expenditure
 * @param {Object} expenditureInput - Expenditure input data
 * @returns {Promise<Object>} The created expenditure object
 */
const createExpenditure = async (expenditureInput) => {
  const ExpenditureModel = await Expenditure();
  const BranchStaffModel = await BranchStaff();
  const UserModel = await User();

  const user = await UserModel.findById(expenditureInput.createdBy);

  // Check if the user is not a superAdmin or admin
  if (!(user.role === 'superAdmin' || user.role === 'admin')) {
    const branch = await BranchStaffModel.findOne({ staffId: expenditureInput.createdBy });

    // Check if the branch is not found
    if (!branch) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Branch not found for the given admin');
    }

    const { branchId } = branch;
    const createdExpenditure = await ExpenditureModel.create({ ...expenditureInput, branchId });
    return createdExpenditure;
  }

  // If user is superAdmin or admin, create the expenditure without branch
  const createdExpenditure = await ExpenditureModel.create(expenditureInput);
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
  const ExpenditureModel = await Expenditure();
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

  const paginatedExpenditures = await ExpenditureModel.paginate(query, options);
  return paginatedExpenditures;
};

/**
 * Get the totalExpenditure from all expenditures
 * @returns {Promise<number>} The totalExpenditure
 */
const getTotalExpenditure = async () => {
  const ExpenditureModel = await Expenditure();
  const totalExpenditure = await ExpenditureModel.aggregate([
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
  const ExpenditureModel = await Expenditure();
  const BranchStaffModel = await BranchStaff();

  const branch = await BranchStaffModel.findOne({ staffId: branchAdmin });
  const totalExpenditure = await ExpenditureModel.aggregate([
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
  const ExpenditureModel = await Expenditure();
  const expenditure = await ExpenditureModel.findById(expenditureId).populate('createdBy', 'firstName lastName');
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
  const ExpenditureModel = await Expenditure();
  const options = {
    page,
    limit,
    sort: { date: 'desc' },
  };

  const query = { userReps: userRepsId };

  const paginatedExpenditures = await ExpenditureModel.paginate(query, options);
  return paginatedExpenditures;
};

/**
 * Approve an expenditure
 * @param {string} expenditureId - ID of the expenditure to be approved
 * @param {string} approvedBy - ID of the user who is approving the expenditure
 * @returns {Promise<Object>} The updated expenditure object
 */
const approveExpenditure = async (expenditureId, approvedBy) => {
  const UserModel = await User();
  const expenditure = await getExpenditureById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }

  if (expenditure.status === 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expenditure is already approved');
  }

  const user = await UserModel.findById(expenditure.createdBy);

  // Validate the role of the approving user
  await validateRole(user.role, approvedBy);

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
  const ExpenditureModel = await Expenditure();
  const expenditure = await ExpenditureModel.findById(expenditureId);
  if (!expenditure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expenditure not found');
  }

  if (expenditure.status === 'rejected') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expenditure is already rejected');
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
