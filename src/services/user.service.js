const httpStatus = require('http-status');
const parsePhoneNumber = require('libphonenumber-js');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Normalize the provided phone number
 * @param {string} phoneNumber
 * @returns {string} Normalized phone number
 */
const normalizePhoneNumber = (phoneNumber) => {
  // Parse and normalize the phone number
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, 'NG');

  // Basic validation
  if (parsedPhoneNumber && parsedPhoneNumber.isValid()) {
    return parsedPhoneNumber.format('E.164');
  }

  // Throw an error for invalid phone numbers
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid phone number');
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const userModel = await User();
  // Normalize the provided phone number
  const normalizedPhoneNumber = normalizePhoneNumber(userBody.phoneNumber);

  // Check if the email is already taken
  if (await User.isPhoneNumberTaken(userBody.phoneNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  } else if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Create the user object with normalized phone number
  const referralCode = Math.floor(100000 + Math.random() * 900000);
  const user = { ...userBody, phoneNumber: normalizedPhoneNumber, referralCode };
  return userModel.create(user);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const userModel = await User();
  const users = await userModel.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const userModel = await User();
  return userModel.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  const userModel = await User();
  return userModel.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const userModel = await User();
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await userModel.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Update user's profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Update data
 * @returns {Promise<User>} Updated user profile
 */
const updateProfile = async (userId, updateData) => {
  const userModel = await User();
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateData.email) {
    // Check if the new email is already taken by another user
    if (await userModel.isEmailTaken(updateData.email, userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    user.email = updateData.email;
  }
  if (updateData.firstName) {
    user.firstName = updateData.firstName;
  }
  if (updateData.lastName) {
    user.lastName = updateData.lastName;
  }
  if (updateData.address) {
    user.address = updateData.address;
  }
  if (updateData.phoneNumber) {
    user.phoneNumber = updateData.phoneNumber;
  }

  await user.save();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateProfile,
};
