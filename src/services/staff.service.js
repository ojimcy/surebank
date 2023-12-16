const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { BranchStaff, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { roles } = require('../config/roles');

/**
 * Get branch staff by id
 * @param {ObjectId} id
 * @returns {Promise<Branch>}
 */
const getBranchStaffById = async (id) => {
  return BranchStaff.findOne({ staffId: id });
};

/**
 * Check if a role is lower or equal in hierarchy to another role
 * @param {string} roleToCheck - Role to check
 * @param {string} comparedRole - Role to compare against
 * @returns {boolean}
 */
const isRoleLowerOrEqual = (roleToCheck, comparedRole) => {
  const roleHierarchy = ['userReps', 'manager', 'admin', 'superAdmin'];
  const indexToCheck = roleHierarchy.indexOf(roleToCheck);
  const indexCompared = roleHierarchy.indexOf(comparedRole);
  return indexToCheck >= 0 && indexCompared >= 0 && indexToCheck <= indexCompared;
};

/**
 * Update the role of a staff member
 * @param {string} userId - User ID
 * @param {string} newRole - New role to assign
 * @param {string} assigningUserRole - Role of the user assigning the new role
 * @returns {Promise<User>}
 * @returns {Promise<User>}
 */
const updateStaffRole = async (userId, newRole, assigningUserRole) => {
  // Check if the new role is a valid role
  if (!roles.includes(newRole)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
  }
  // Check if the assigning user has the authority to assign this role
  if (!isRoleLowerOrEqual(newRole, assigningUserRole)) {
    throw new ApiError(httpStatus.FORBIDDEN, "You don't have permissions to assign this role");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.role = newRole;
  await user.save();
  return user;
};

/**
 * Create branch staff
 * @param {string} branchId
 * @param {string} staffId
 * @returns {Promise<BranchStaff>}
 */
const addStaffToBranch = async (branchId, staffId, newRole, assigningUserRole) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const checkStaff = await BranchStaff.findOne({ staffId });
    if (checkStaff) {
      throw new ApiError('Staff already belongs to a branch');
    }

    const branchStaff = await BranchStaff.create([{ branchId, staffId, isCurrent: true }], { session });

    await updateStaffRole(staffId, newRole, assigningUserRole);

    await session.commitTransaction();
    session.endSession();

    return branchStaff;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all staff with pagination
 * @param {Object} branchId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ staffIds: Object, totalCounts: number, error: string|null }>}
 */
const getAllStaffService = async (filter, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const query = {};

  if (filter.branchId) {
    query['branchId.id'] = filter.branchId.id;
  }

  if (filter.isCurrent !== undefined) {
    query.isCurrent = filter.isCurrent;
  }

  const branchStaff = await BranchStaff.find(query)
    .populate([
      {
        path: 'staffId',
        select: 'firstName lastName role',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort(sortBy);

  return branchStaff;
};

/**
 * Get staff in branch with pagination
 * @param {Object} branchId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ staffIds: Object, totalCounts: number, error: string|null }>}
 */
const getStaffInBranch = async (branchId, filter, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const branchStaff = await BranchStaff.find({ branchId })
    .populate([
      {
        path: 'staffId',
        select: 'firstName lastName role',
      },
      {
        path: 'branchId',
        select: 'name',
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort(sortBy);
  return branchStaff;
};

const updateBranchStaffService = async (staffId, branchId) => {
  try {
    // console.log(branchId, staffId);
    const updatedBranchStaff = await BranchStaff.findOneAndUpdate(
      { staffId },
      { branchId },
      // { isCurrent: false },
      { new: true, useFindAndModify: false }
    );

    return updatedBranchStaff;
  } catch (error) {
    throw new Error('Failed to update branch staff');
  }
};

/**
 * Delete branch staff by id
 * @param {ObjectId} branchId
 * @returns {Promise<Branch>}
 */
const deleteBranchStaffById = async (branchStaffId) => {
  const branch = await getBranchStaffById(branchStaffId);
  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }
  await branch.remove();
  return branch;
};

/**
 * Delete branch staff by id
 * @param {ObjectId} branchId
 * @returns {Promise<Branch>}
 */
const deleteAllBranchStaffById = async (branchId) => {
  const branch = await BranchStaff.deleteMany({ branchId });
  return branch;
};

/**
 * Delete staff by ID
 * @param {string} staffId - ID of the staff to delete
 * @returns {Promise<void>}
 */
const deleteStaffById = async (staffId) => {
  const staff = await BranchStaff.findById(staffId);
  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff not found');
  }
  await staff.remove();
};

/**
 * Get branch staff by user id
 * @param {ObjectId} userId
 * @returns {Promise<BranchStaff>}
 */
const getBranchStaffByUserId = async (userId) => {
  return BranchStaff.findOne({ staffId: userId });
};

module.exports = {
  addStaffToBranch,
  getStaffInBranch,
  getAllStaffService,
  updateBranchStaffService,
  deleteBranchStaffById,
  deleteAllBranchStaffById,
  deleteStaffById,
  updateStaffRole,
  getBranchStaffByUserId,
};
