const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { getUserOne, getUserTwo, getAdmin } = require('./user.fixture');

// Function to generate and save an access token for a given user
const generateUserAccessToken = async (user) => {
  const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = tokenService.generateToken(user._id, expires, tokenTypes.ACCESS);
  // Save the token to the database
  await tokenService.saveToken(accessToken, user._id, expires, tokenTypes.ACCESS);
  return accessToken;
};

// Generate tokens for user instances, optionally accepting a specific user
const getUserOneAccessToken = async (user = getUserOne()) => {
  return generateUserAccessToken(user);
};

const getUserTwoAccessToken = async (user = getUserTwo()) => {
  return generateUserAccessToken(user);
};

const getAdminAccessToken = async (user = getAdmin()) => {
  return generateUserAccessToken(user);
};

module.exports = {
  getUserOneAccessToken,
  getUserTwoAccessToken,
  getAdminAccessToken,
  generateUserAccessToken,
};
