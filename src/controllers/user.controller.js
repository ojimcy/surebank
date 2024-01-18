const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { email, firstName, lastName, address, phoneNumber } = req.body;
  const updateData = {
    email,
    firstName,
    lastName,
    address,
    phoneNumber,
  };

  const updatedUser = await userService.updateProfile(userId, updateData);

  res.send(updatedUser);
});

const me = catchAsync(async (req, res) => {
  const { user } = req;
  res.send(user);
});

const resetPassword = catchAsync(async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;
  await userService.resetPassword(userId, password, newPassword, confirmPassword);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  me,
  resetPassword,
};
