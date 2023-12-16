const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { staffService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const { getUserById } = require('../services/user.service');

const addStaffToBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { staffId } = req.body;
  const branchStaff = await staffService.addStaffToBranch(branchId, staffId);
  res.send(branchStaff);
});

const createStaff = catchAsync(async (req, res) => {
  const { staffId, branchId, role } = req.body;
  const assigningUser = await getUserById(req.user._id);
  const assigningUserRole = assigningUser.role;
  const branchStaff = await staffService.addStaffToBranch(branchId, staffId, role, assigningUserRole);
  res.send(branchStaff);
});

const getAllStaff = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['staffId', 'isCurrent', 'branchId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await staffService.getAllStaffService(filter, options);
  res.send(result);
});

const getStaffInBranch = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const filter = pick(req.query, ['staffId', 'isCurrent']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await staffService.getStaffInBranch(branchId, filter, options);
  res.send(result);
});

const updateBranchStaff = catchAsync(async (req, res) => {
  const { staffId, branchId } = req.body;
  const branchStaff = staffService.updateBranchStaffService(staffId, branchId);
  res.send(branchStaff);
});

const deleteStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  await staffService.deleteStaffById(staffId);

  res.status(httpStatus.NO_CONTENT).send();
});

const updateStaffRole = catchAsync(async (req, res) => {
  const { userId, role } = req.body;

  // Get the role of the user making the request
  const assigningUser = await getUserById(req.user._id);
  const assigningUserRole = assigningUser.role;
  try {
    const updatedUser = await staffService.updateStaffRole(userId, role, assigningUserRole);
    res.status(httpStatus.OK).send(updatedUser);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});

const getBranchStaffByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const branchStaff = await staffService.getBranchStaffByUserId(userId);
  res.send(branchStaff);
});

module.exports = {
  addStaffToBranch,
  createStaff,
  getAllStaff,
  getStaffInBranch,
  updateBranchStaff,
  deleteStaff,
  updateStaffRole,
  getBranchStaffByUserId,
};
