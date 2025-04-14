const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const { User } = require('../../src/models');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

// Create user objects with function getters to generate new IDs for each test
const getUserOne = () => ({
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  address: faker.address.streetAddress(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
});

const getUserTwo = () => ({
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  address: faker.address.streetAddress(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
});

const getAdmin = () => ({
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  address: faker.address.streetAddress(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
});

// Create instances for use in tests
const userOne = getUserOne();
const userTwo = getUserTwo();
const admin = getAdmin();

const insertUsers = async (users) => {
  // Get User model asynchronously
  const UserModel = await User();
  await UserModel.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  getUserOne,
  getUserTwo,
  getAdmin,
  insertUsers,
};
