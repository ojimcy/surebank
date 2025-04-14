const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../../src/app');
const config = require('../../src/config/config');
const auth = require('../../src/middlewares/auth');
const { tokenService, emailService } = require('../../src/services');
const ApiError = require('../../src/utils/ApiError');
const setupTestDB = require('../utils/setupTestDB');
const { roleRights } = require('../../src/config/roles');
const { tokenTypes } = require('../../src/config/tokens');
const { getUserOne, getUserTwo, getAdmin, insertUsers } = require('../fixtures/user.fixture');
const { getUserOneAccessToken, getUserTwoAccessToken, getAdminAccessToken } = require('../fixtures/token.fixture');
const tokenSchema = require('../../src/models/token.schema');
const { User } = require('../../src/models');

setupTestDB();

// Ensure Token model is registered before tests
beforeAll(async () => {
  if (!mongoose.models.Token) {
    mongoose.model('Token', tokenSchema);
  }
});

// Replace direct User.findById calls with an async wrapper
const findUserById = async (id) => {
  const UserModel = await User();
  return UserModel.findById(id);
};

describe('Auth routes', () => {
  describe('POST /v1/auth/register', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        address: faker.address.streetAddress(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        referralCode: faker.random.alphaNumeric(6),
        phoneNumber: faker.phone.phoneNumber(),
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.CREATED);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({
        id: expect.anything(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        referralCode: newUser.referralCode,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        role: 'user',
        isEmailVerified: false,
        isActive: true,
        isTwoFactorAuthEnabled: false,
        kycStatus: 'unverified',
        kycType: 'none',
        passwordAttempts: 0,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        lastPasswordChange: expect.anything(),
      });

      const dbUser = await findUserById(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        referralCode: newUser.referralCode,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        role: 'user',
        isEmailVerified: false,
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      newUser.email = freshUser.email;

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const loginCredentials = {
        email: freshUser.email,
        password: freshUser.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        address: freshUser.address,
        email: freshUser.email,
        role: freshUser.role,
        isEmailVerified: freshUser.isEmailVerified,
        isActive: true,
        isTwoFactorAuthEnabled: false,
        kycStatus: 'unverified',
        kycType: 'none',
        passwordAttempts: 0,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        lastPasswordChange: expect.anything(),
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const unusedUser = getUserOne(); // Create but don't insert
      const loginCredentials = {
        email: unusedUser.email,
        password: unusedUser.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });

    test('should return 401 error if password is wrong', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const loginCredentials = {
        email: freshUser.email,
        password: 'wrongPassword1',
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, freshUser._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const TokenModel = await mongoose.model('Token');
      const dbRefreshTokenDoc = await TokenModel.findOne({ token: refreshToken });
      expect(dbRefreshTokenDoc).toBe(null);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/logout').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, freshUser._id, expires, tokenTypes.REFRESH, true);

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    test('should return 200 and new auth tokens if refresh token is valid', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, freshUser._id, expires, tokenTypes.REFRESH);

      const res = await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });

      const dbUser = await findUserById(freshUser._id);
      expect(dbUser).toBeDefined();

      const TokenModel = await mongoose.model('Token');
      const dbRefreshTokenDoc = await TokenModel.findOne({ token: res.body.refresh.token });
      expect(dbRefreshTokenDoc).toMatchObject({ type: tokenTypes.REFRESH, user: freshUser._id, blacklisted: false });

      const dbRefreshTokenCount = await TokenModel.countDocuments();
      expect(dbRefreshTokenCount).toBe(1);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/refresh-tokens').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if refresh token is signed using an invalid secret', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.REFRESH, 'invalidSecret');
      await tokenService.saveToken(refreshToken, getUserTwo()._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is not found in the database', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is blacklisted', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, getUserTwo()._id, expires, tokenTypes.REFRESH, true);

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is expired', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().subtract(1, 'minutes');
      const refreshToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, getUserTwo()._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if user is not found', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, getUserTwo()._id, expires, tokenTypes.REFRESH);

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    beforeEach(() => {
      // Remove the spy on the non-existent transport
      // jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send reset password email to the user', async () => {
      await insertUsers([getUserTwo()]);
      const sendResetPasswordEmailSpy = jest.spyOn(emailService, 'sendResetPasswordEmail').mockResolvedValue();
      const requestBody = { email: getUserTwo().email };

      await request(app).post('/v1/auth/forgot-password').send(requestBody).expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(getUserTwo().email, expect.any(String));
      const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];

      const TokenModel = await mongoose.model('Token');
      const dbResetPasswordTokenDoc = await TokenModel.findOne({ token: resetPasswordToken, user: getUserTwo()._id });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      await insertUsers([getUserTwo()]);

      await request(app).post('/v1/auth/forgot-password').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if email does not belong to any user', async () => {
      await request(app).post('/v1/auth/forgot-password').send({ email: getUserTwo().email }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    test('should return 204 and reset the password', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, freshUser._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await findUserById(freshUser._id);
      const isPasswordMatch = await bcrypt.compare('password2', dbUser.password);
      expect(isPasswordMatch).toBe(true);

      const TokenModel = await mongoose.model('Token');
      const dbResetPasswordTokenDoc = await TokenModel.findOne({ token: resetPasswordToken });
      expect(dbResetPasswordTokenDoc).toBe(null);
    });

    test('should return 400 if reset password token is missing', async () => {
      await insertUsers([getUserTwo()]);

      await request(app).post('/v1/auth/reset-password').send({ password: 'password2' }).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if reset password token is blacklisted', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD, true);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if reset password token is expired', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().subtract(1, 'minutes');
      const resetPasswordToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if password is missing or invalid', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, getUserTwo()._id, expires, tokenTypes.RESET_PASSWORD);

      await request(app).post('/v1/auth/reset-password').query({ token: resetPasswordToken }).expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'short1' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: '11111111' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    beforeEach(() => {
      // Remove the spy on the non-existent transport
      // jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send verification email to the user', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const freshToken = await getUserOneAccessToken(freshUser);
      const sendVerificationEmailSpy = jest.spyOn(emailService, 'sendVerificationEmail');

      await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(httpStatus.NO_CONTENT);

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(freshUser.email, expect.any(String));
      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      const TokenModel = await mongoose.model('Token');
      const dbVerifyEmailToken = await TokenModel.findOne({
        token: verifyEmailToken,
        user: freshUser._id,
        type: tokenTypes.VERIFY_EMAIL,
      });

      expect(dbVerifyEmailToken).toBeDefined();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([getUserTwo()]);

      await request(app).post('/v1/auth/send-verification-email').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    test('should return 204 and verify the email', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, freshUser._id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.NO_CONTENT);

      const TokenModel = await mongoose.model('Token');
      const dbVerifyEmailTokenDoc = await TokenModel.findOne({ token: verifyEmailToken, user: freshUser._id });
      expect(dbVerifyEmailTokenDoc).toBe(null);

      const dbUser = await findUserById(freshUser._id);
      expect(dbUser.isEmailVerified).toBe(true);
    });

    test('should return 400 if verify email token is missing', async () => {
      await insertUsers([getUserTwo()]);

      await request(app).post('/v1/auth/verify-email').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if verify email token is blacklisted', async () => {
      await insertUsers([getUserTwo()]);
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(getUserTwo()._id, expires);
      await tokenService.saveToken(verifyEmailToken, getUserTwo()._id, expires, tokenTypes.VERIFY_EMAIL, true);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if verify email token is expired', async () => {
      const freshUser = getUserOne();
      await insertUsers([freshUser]);
      const expires = moment().subtract(1, 'minutes');
      const verifyEmailToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, freshUser._id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const deletedUser = getUserOne();
      await insertUsers([deletedUser]);
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(deletedUser._id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, deletedUser._id, expires, tokenTypes.VERIFY_EMAIL);

      // Delete the user
      const UserModel = await User();
      await UserModel.deleteOne({ _id: deletedUser._id });

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Auth middleware', () => {
  test('should call next with no errors if access token is valid', async () => {
    const freshUser = getUserOne();
    await insertUsers([freshUser]);
    const freshToken = await getUserOneAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${freshToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user._id).toEqual(freshUser._id);
  });

  test('should call next with unauthorized error if access token is not found in header', async () => {
    await insertUsers([getUserTwo()]);
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    await insertUsers([getUserTwo()]);
    const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if the token is not an access token', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const refreshToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.REFRESH);
    await tokenService.saveToken(refreshToken, freshUser._id, expires, tokenTypes.REFRESH);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.ACCESS, 'invalidSecret');
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is expired', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const expires = moment().subtract(1, 'minutes');
    const accessToken = tokenService.generateToken(freshUser._id, expires, tokenTypes.ACCESS);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if user is not found', async () => {
    const freshUser = getUserTwo(); // Generate user but don't insert
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
  });

  test('should call next with no errors if user does not have required rights but userId is in params', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${token}` },
      params: { userId: freshUser._id.toHexString() },
    });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required rights', async () => {
    const freshAdmin = getAdmin();
    await insertUsers([freshAdmin]);
    const freshToken = await getAdminAccessToken(freshAdmin);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${freshToken}` },
      params: { userId: freshAdmin._id.toHexString() },
    });
    const next = jest.fn();

    await auth(...roleRights.get('admin'))(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has basic user rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('updateProfile')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required package rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('createPackage')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required payment rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('makeContribution')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required product rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('getProducts')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with forbidden error if user does not have admin rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('manageBranch')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
  });

  test('should call next with no errors if admin has required rights via hierarchy', async () => {
    const freshAdmin = getAdmin();
    await insertUsers([freshAdmin]);
    const freshAdminToken = await getAdminAccessToken(freshAdmin);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${freshAdminToken}` },
    });
    const next = jest.fn();

    await auth('managePackages')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if admin has user rights', async () => {
    const freshUser = getUserTwo();
    await insertUsers([freshUser]);
    const token = await getUserTwoAccessToken(freshUser);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${token}` } });
    const next = jest.fn();

    await auth('updateProfile')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
