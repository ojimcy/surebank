const httpStatus = require('http-status');
const { Branch } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a Branch
 * @param {Object} branchBody
 * @returns {Promise<User>}
 */

const createBranch = async (branchBody) => {
  const name = branchBody;
  const checkBranch = await Branch.findOne({
    // eslint-disable-next-line security/detect-non-literal-regexp
    name: { $regex: new RegExp(name, 'i') },
  });

  if (checkBranch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch already exist');
  }
  const branch = Branch.create(branchBody);
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
 * Get branch by id
 * @param {ObjectId} id
 * @returns {Promise<Branch>}
 */
const getBranchById = async (id) => {
  return Branch.findById(id);
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

module.exports = {
  createBranch,
  getBranchById,
  queryBranches,
  updateBranchManager,
};
