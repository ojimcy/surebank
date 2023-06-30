const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { branchService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const { User } = require('../models');

const createBranch = catchAsync(async (req, res) => {
  const branch = await branchService.createBranch(req.body);
  res.status(httpStatus.CREATED).send(branch);
});

const getBranches = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await branchService.queryBranches(filter, options);
  res.send(result);
});

const getBranch = catchAsync(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);
  if (!branch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }
  res.send(branch);
});

const updateBranchManager = catchAsync(async (req, res) => {
  const branch = await branchService.updateBranchManager(req.params.branchId, req.body);

  res.send(branch);
});

const addStaffToBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { staffId } = req.body;
  const branchStaff = await branchService.addStaffToBranch(branchId, staffId);
  res.send(branchStaff);
});

const getStaffInBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await branchService.getStaffInBranch(branchId, filter, options);
  if (result.error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, result.error);
  }

  const staffIds = result.map((staff) => staff.staffId);
  const users = await User.find({ userId: { $in: staffIds } });
  res.send(users);
});

const updateBranchStaff = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { staffId } = req.query;
  const branchStaff = branchService.updateBranchStaff(staffId, branchId);
  res.send(branchStaff);
});

const deleteBranch = catchAsync(async (req, res) => {
  await branchService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBranch,
  getBranch,
  getBranches,
  updateBranchManager,
  addStaffToBranch,
  getStaffInBranch,
  updateBranchStaff,
  deleteBranch,
};
