const httpStatus = require('http-status');
const { Branch, BranchStaff } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a Branch
 * @param {Object} branchBody
 * @returns {Promise<User>}
 */
const createBranch = async (branchBody) => {
  const { name } = branchBody;
  const checkBranch = await Branch.findOne({ name: name.toLowerCase() });

  if (checkBranch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch already exists');
  }

  const branch = await Branch.create({ ...branchBody, name: name.toLowerCase() });
  return branch;
};

/**
 * Query for branches
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBranches = async (filter, options) => {
  const branches = await Branch.paginate(filter, options);
  return branches;
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
 * Get branch by id
 * @param {ObjectId} id
 * @returns {Promise<Branch>}
 */
const getBranchById = async (id) => {
  return Branch.findById(id);
};

const getBranchByEmail = async (email) => {
  return Branch.findOne({ email });
};

/**
 * Update branch by id
 * @param {string} branchId
 * @param {Object} updateBody
 * @returns {Promise<Branch>}
 */
const updateBranchById = async (branchId, updateBody) => {
  const branch = await getBranchById(branchId);
  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }
  const checkEmail = await getBranchByEmail(updateBody.email);
  if (checkEmail && checkEmail._id === branchId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // if (updateBody.email && (await Branch.isEmailTaken(updateBody.email, branchId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(branch, updateBody);
  await branch.save();
  return branch;
};

/**
 * Update branch manager by branchId
 * @param {string} branchId
 * @param {string} manager
 * @returns {Promise<Branch>}
 */
const updateBranchManager = async (branchId, manager) => {
  const updatedBranch = await Branch.findByIdAndUpdate(branchId, manager, { new: true });

  if (!updatedBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }

  return updatedBranch;
};

/**
 * Create branch staff
 * @param {string} branchId
 * @param {string} staffId
 * @returns {Promise<BranchStaff>}
 */
const addStaffToBranch = async (branchId, staffId) => {
  const checkStaff = await BranchStaff.findOne({
    staffId,
  });

  if (checkStaff) {
    throw new ApiError('Staff already belongs to a branch');
  }

  const branchStaff = await BranchStaff.create({
    branchId,
    staffId,
    isCurrent: true,
  });
  return branchStaff;
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

  const branchStaff = await BranchStaff.find({})
    .populate([
      {
        path: 'staffId',
        select: 'firstName lastName',
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

  const branchStaff = await BranchStaff.find({ branchId }).skip(skip).limit(limit).sort(sortBy);
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
 * Delete branch by id
 * @param {ObjectId} branchId
 * @returns {Promise<Branch>}
 */
const deleteBranchById = async (branchId) => {
  const branch = await getBranchById(branchId);
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
 * Get branch by name (case-insensitive)
 * @param {string} name - Branch name
 * @returns {Promise<Branch>}
 */
const getBranchByName = async (name) => {
  return Branch.findOne({ name: name.toLowerCase() });
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

module.exports = {
  createBranch,
  getBranchById,
  queryBranches,
  updateBranchById,
  updateBranchManager,
  addStaffToBranch,
  getStaffInBranch,
  getAllStaffService,
  updateBranchStaffService,
  deleteBranchById,
  deleteBranchStaffById,
  deleteAllBranchStaffById,
  getBranchByEmail,
  getBranchByName,
  deleteStaffById,
};
