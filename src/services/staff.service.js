const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { BranchStaff, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { roles } = require('../config/roles');
const { getUserById } = require('./user.service');
const { userService } = require('.');

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
 * Validate if the assigning user has the authority to assign the given role
 * @param {string} roleToCheck - Role to check
 * @param {string} assigningUserId - ID of the assigning user
 */
const validateRole = async (roleToCheck, assigningUserId) => {
  // Retrieve assigning user's role
  const assigningUser = await getUserById(assigningUserId);

  // Check if the assigning user has the authority to assign this role
  if (!isRoleLowerOrEqual(roleToCheck, assigningUser.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, `You don't have permissions to create a ${roleToCheck}`);
  }
};

/**
 * Create a staff
 * @param {Object} staffData - Staff data
 * @param {string} staffData.email - Staff's email
 * @param {string} staffData.password - Staff's password
 * @param {string} staffData.firstName - Staff's first name
 * @param {string} staffData.lastName - Staff's last name
 * @param {string} staffData.address - Staff's address
 * @param {string} staffData.accountType - Account type
 * @param {string} staffData.phoneNumber - Staff's phone number
 * @param {string} staffData.branchId - Branch ID
 * @param {string} staffData.createdBy - ID of the admin user who initiated the creation
 * @returns {Promise<{ user: User, account: Account }>} Created user and account
 */
const createStaff = async (staffData) => {
  const BranchStaffModel = await BranchStaff();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate the role before querying the user
    if (!roles.includes(staffData.role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
    }

    // Separate function for role validation
    validateRole(staffData.role, staffData.createdBy);

    let user;

    // Get user data
    if (staffData.email) {
      user = await userService.getUserByEmail(staffData.email);
    } else if (staffData.phoneNumber) {
      user = await userService.getUserByPhoneNumber(staffData.phoneNumber);
    }

    if (!user) {
      // If user doesn't exist, create a new user
      const newUserAccount = await userService.createUser({
        email: staffData.email,
        password: staffData.password,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        address: staffData.address,
        phoneNumber: staffData.phoneNumber,
        role: staffData.role,
        branchId: staffData.branchId,
      });

      const staffAccountData = {
        branchId: staffData.branchId,
        staffId: newUserAccount._id,
        isCurrent: true,
        createdBy: staffData.createdBy,
      };

      const staff = await BranchStaffModel.create([staffAccountData], { session });

      await session.commitTransaction();
      session.endSession();

      return { user: newUserAccount, staff };
    }

    // Check if there is already a corresponding entry in BranchStaff for the given branch
    const existingBranchStaff = await BranchStaffModel.findOne({
      branchId: staffData.branchId,
      staffId: user.id,
    });
    if (existingBranchStaff) {
      throw new ApiError(httpStatus.CONFLICT, 'Staff already exists in the branch');
    }
    const staffAccountData = {
      branchId: staffData.branchId,
      staffId: user._id,
      isCurrent: true,
      createdBy: staffData.createdBy,
    };

    const staff = await BranchStaffModel.create([staffAccountData], { session });

    await session.commitTransaction();
    session.endSession();

    return { user, staff };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get branch staff by id
 * @param {ObjectId} id
 * @returns {Promise<Branch>}
 */
const getBranchStaffById = async (id) => {
  return BranchStaff.findOne({ staffId: id });
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
  const UserModel = await User();
  // Check if the new role is a valid role
  if (!roles.includes(newRole)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
  }
  // Check if the assigning user has the authority to assign this role
  if (!isRoleLowerOrEqual(newRole, assigningUserRole)) {
    throw new ApiError(httpStatus.FORBIDDEN, "You don't have permissions to assign this role");
  }

  const user = await UserModel.findById(userId);
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
  const BranchStaffModel = await BranchStaff();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const checkStaff = await BranchStaffModel.findOne({ staffId });
    if (checkStaff) {
      throw new ApiError('Staff already belongs to a branch');
    }

    const branchStaff = await BranchStaffModel.create([{ branchId, staffId, isCurrent: true }], { session });

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
  const BranchStaffModel = await BranchStaff();

  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const query = {};

  if (filter.branchId) {
    query['branchId.id'] = filter.branchId.id;
  }

  if (filter.isCurrent !== undefined) {
    query.isCurrent = filter.isCurrent;
  }

  const branchStaff = await BranchStaffModel.find(query)
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
  const BranchStaffModel = await BranchStaff();
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const branchStaff = await BranchStaffModel.find({ branchId })
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
    const BranchStaffModel = await BranchStaff();
    // console.log(branchId, staffId);
    const updatedBranchStaff = await BranchStaffModel.findOneAndUpdate(
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
  const BranchStaffModel = await BranchStaff();
  const branch = await BranchStaffModel.deleteMany({ branchId });
  return branch;
};

/**
 * Delete staff by ID
 * @param {string} staffId - ID of the staff to delete
 * @returns {Promise<void>}
 */
const deleteStaffById = async (staffId) => {
  const BranchStaffModel = await BranchStaff();
  const staff = await BranchStaffModel.findById(staffId);
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
  const BranchStaffModel = await BranchStaff();
  return BranchStaffModel.findOne({ staffId: userId });
};

const validateDeactivationAuthority = async (staffRole, assigningUserId) => {
  // Retrieve the role of the assigning user
  const assigningUser = await getUserById(assigningUserId);

  // Check if the assigning user has the authority to deactivate the staff member
  if (!isRoleLowerOrEqual(staffRole, assigningUser.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, "You don't have permissions to deactivate or reactivate this staff member");
  }
};

/**
 * Deactivate a staff member
 * @param {string} staffId - ID of the staff member to deactivate
 * @param {string} assigningUserId - ID of the user initiating the deactivation
 * @returns {Promise<void>}
 */
const deactivateStaff = async (staffId, assigningUserId) => {
  const BranchStaffModel = await BranchStaff();
  const user = await getUserById(staffId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Validate if the assigning user has the authority to deactivate this staff member
  validateDeactivationAuthority(user.role, assigningUserId);

  // Deactivate the staff member by updating their status to inactive
  await user.updateOne({ isActive: false });

  // Update the BranchStaff to set isActive to false
  await BranchStaffModel.updateOne({ staffId }, { isActive: false });
};

/**
 * Reactivate a staff member
 * @param {string} staffId - ID of the staff member to reactivate
 * @param {string} assigningUserId - ID of the user initiating the reactivation
 * @returns {Promise<void>}
 */
const reactivateStaff = async (staffId, assigningUserId) => {
  const BranchStaffModel = await BranchStaff();
  const user = await getUserById(staffId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Validate if the assigning user has the authority to reactivate this staff member
  validateDeactivationAuthority(user.role, assigningUserId);

  // Deactivate the staff member by updating their status to active
  await user.updateOne({ isActive: true });

  // Update the BranchStaff to set isActive to false
  await BranchStaffModel.updateOne({ staffId }, { isActive: true });
};

module.exports = {
  createStaff,
  addStaffToBranch,
  getStaffInBranch,
  getAllStaffService,
  updateBranchStaffService,
  deleteBranchStaffById,
  deleteAllBranchStaffById,
  deleteStaffById,
  updateStaffRole,
  getBranchStaffByUserId,
  deactivateStaff,
  reactivateStaff,
};
