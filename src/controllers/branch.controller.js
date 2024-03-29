const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { branchService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

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

const deleteBranch = catchAsync(async (req, res) => {
  await branchService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteStaff = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  await branchService.deleteStaffById(staffId);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBranch,
  getBranch,
  getBranches,
  updateBranchManager,
  updateBranch,
  deleteBranch,
  deleteStaff,
};
