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
  const createdBy = req.user._id;
  const { ...staffData } = req.body;
  const { user, staff } = await staffService.createStaff({ ...staffData, createdBy });
  res.status(httpStatus.CREATED).json({ user, staff });
});

const getAllStaff = catchAsync(async (req, res) => {
  // Pick relevant options
  const filter = pick(req.query, ['staffId', 'isCurrent', 'branchId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  options.limit = parseInt(options.limit, 10) || 20;
  options.page = parseInt(options.page, 10) || 1;
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

const deactivateStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  const userId = req.user._id;

  await staffService.deactivateStaff(staffId, userId);

  res.status(httpStatus.NO_CONTENT).send();
});

const reactivateStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  const userId = req.user._id;

  await staffService.reactivateStaff(staffId, userId);

  res.status(httpStatus.NO_CONTENT).send();
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
  deactivateStaff,
  reactivateStaff,
};
