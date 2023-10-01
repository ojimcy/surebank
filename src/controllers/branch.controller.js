const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { branchService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const { User } = require('../models');
const { getUserById } = require('../services/user.service');

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
const updateBranch = catchAsync(async (req, res) => {
  const branch = await branchService.updateBranchById(req.params.branchId, req.body);

  res.send(branch);
});

const addStaffToBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { staffId } = req.body;
  const branchStaff = await branchService.addStaffToBranch(branchId, staffId);
  res.send(branchStaff);
});

const createStaff = catchAsync(async (req, res) => {
  const { staffId, branchId, role } = req.body;
  const assigningUser = await getUserById(req.user._id);
  const assigningUserRole = assigningUser.role;
  const branchStaff = await branchService.addStaffToBranch(branchId, staffId, role, assigningUserRole);
  res.send(branchStaff);
});

const getAllStaff = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['staffId', 'isCurrent']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await branchService.getAllStaffService(filter, options);
  res.send(result);
});

const getStaffInBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const filter = pick(req.query, ['staffId', 'isCurrent']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const staffMembers = await branchService.getStaffInBranch(branchId, filter, options);

  const staffIds = staffMembers.map((staff) => staff.staffId);

  // Use the staffIds to fetch the corresponding user details from the User collection.
  const users = await User.find({ _id: { $in: staffIds } });

  res.send(users);
});

const updateBranchStaff = catchAsync(async (req, res) => {
  const { staffId, branchId } = req.body;
  const branchStaff = branchService.updateBranchStaffService(staffId, branchId);
  res.send(branchStaff);
});

const deleteBranch = catchAsync(async (req, res) => {
  await branchService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  await branchService.deleteStaffById(staffId);

  res.status(httpStatus.NO_CONTENT).send();
});

const updateStaffRole = catchAsync(async (req, res) => {
  const { userId, role } = req.body;

  // Get the role of the user making the request
  const assigningUser = await getUserById(req.user._id);
  const assigningUserRole = assigningUser.role;
  try {
    const updatedUser = await branchService.updateStaffRole(userId, role, assigningUserRole);
    res.status(httpStatus.OK).send(updatedUser);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

module.exports = {
  createBranch,
  getBranch,
  getBranches,
  updateBranchManager,
  addStaffToBranch,
  createStaff,
  getAllStaff,
  getStaffInBranch,
  updateBranchStaff,
  updateBranch,
  deleteBranch,
  deleteStaff,
  updateStaffRole,
};
