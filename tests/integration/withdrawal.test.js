const request = require('supertest');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User, WithdrawalRequest, Account } = require('../../src/models');
const { userService, tokenService, paystackService } = require('../../src/services');

setupTestDB();

// Mock external services
jest.mock('../../src/services/paystack.service');
jest.mock('../../src/services/notification.service');
jest.mock('../../src/config/logger');

describe('Withdrawal API', () => {
  let userAccessToken;
  let managerAccessToken;
  let user;
  let manager;
  let account;
  let withdrawalRequest;

  beforeEach(async () => {
    // Create test users with appropriate roles
    user = {
      _id: mongoose.Types.ObjectId(),
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user',
    };

    manager = {
      _id: mongoose.Types.ObjectId(),
      firstName: 'Account',
      lastName: 'Manager',
      email: 'manager@example.com',
      password: 'password123',
      role: 'manager',
    };

    // Add required permissions to user role
    await userService.addPermissionToRole('user', 'selfWithdrawal');
    await userService.addPermissionToRole('user', 'getSelfWithdrawal');
    await userService.addPermissionToRole('manager', 'approveWithdrawalRequests');

    // Save users to database
    await User.insertMany([user, manager]);

    // Create access tokens
    userAccessToken = (await tokenService.generateAuthTokens(user)).access.token;
    managerAccessToken = (await tokenService.generateAuthTokens(manager)).access.token;

    // Create test account for the user
    account = {
      _id: mongoose.Types.ObjectId(),
      accountNumber: '12345678',
      userId: user._id,
      packageId: mongoose.Types.ObjectId(),
      accountType: 'ds',
      accountManagerId: manager._id,
      availableBalance: 10000,
      heldAmount: 0,
    };
    await Account.create(account);

    // Setup PayStack mocks
    paystackService.createTransferRecipient.mockResolvedValue({
      data: {
        recipient_code: 'rec-123',
      },
    });

    paystackService.initiateTransfer.mockResolvedValue({
      status: true,
      data: {
        reference: 'transfer-ref-123',
        recipient_code: 'rec-123',
        transfer_code: 'transfer-123',
      },
    });
  });

  describe('POST /v1/payment/withdrawal/request', () => {
    test('should return 201 and successfully create a withdrawal request', async () => {
      const withdrawalData = {
        accountNumber: account.accountNumber,
        amount: 5000,
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
        reason: 'Need cash',
      };

      const res = await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('status', 'pending');
      expect(res.body).toHaveProperty('accountNumber', account.accountNumber);
      expect(res.body).toHaveProperty('amount', 5000);

      // Verify account balance is updated with held amount
      const updatedAccount = await Account.findOne({ accountNumber: account.accountNumber });
      expect(updatedAccount.heldAmount).toBe(5000);
      expect(updatedAccount.availableBalance).toBe(5000);

      // Save for later tests
      withdrawalRequest = res.body;
    });

    test('should return 400 when attempting to withdraw more than available balance', async () => {
      const withdrawalData = {
        accountNumber: account.accountNumber,
        amount: 20000, // More than the available balance
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
        reason: 'Need cash',
      };

      await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 when account does not exist', async () => {
      const withdrawalData = {
        accountNumber: '99999999',
        amount: 5000,
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
      };

      await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 when trying to withdraw from another user account', async () => {
      // Create another user
      const anotherUser = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'password123',
        role: 'user',
      };
      await User.create(anotherUser);

      // Create another account
      const anotherAccount = {
        _id: mongoose.Types.ObjectId(),
        accountNumber: '87654321',
        userId: anotherUser._id,
        packageId: mongoose.Types.ObjectId(),
        accountType: 'ds',
        accountManagerId: manager._id,
        availableBalance: 10000,
        heldAmount: 0,
      };
      await Account.create(anotherAccount);

      const withdrawalData = {
        accountNumber: anotherAccount.accountNumber,
        amount: 5000,
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
      };

      await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/payment/withdrawal/status/:id', () => {
    test('should return 200 and the withdrawal status', async () => {
      // First create a withdrawal request
      const withdrawalData = {
        accountNumber: account.accountNumber,
        amount: 5000,
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
        reason: 'Need cash',
      };

      const createRes = await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData);

      // Then check the status
      const res = await request(app)
        .get(`/v1/payment/withdrawal/status/${createRes.body._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('status', 'pending');
      expect(res.body).toHaveProperty('accountNumber', account.accountNumber);
    });

    test('should return 404 when withdrawal request does not exist', async () => {
      await request(app)
        .get(`/v1/payment/withdrawal/status/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 when trying to access another user withdrawal', async () => {
      // Create another user with token
      const anotherUser = {
        _id: mongoose.Types.ObjectId(),
        firstName: 'Another',
        lastName: 'User',
        email: 'another2@example.com',
        password: 'password123',
        role: 'user',
      };
      await User.create(anotherUser);
      const anotherUserToken = (await tokenService.generateAuthTokens(anotherUser)).access.token;

      // First create a withdrawal request with original user
      const withdrawalData = {
        accountNumber: account.accountNumber,
        amount: 5000,
        bankName: 'Test Bank',
        bankCode: '057',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Test User',
        reason: 'Need cash',
      };

      const createRes = await request(app)
        .post('/v1/payment/withdrawal/request')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(withdrawalData);

      // Try to access with different user
      await request(app)
        .get(`/v1/payment/withdrawal/status/${createRes.body._id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // Implement tests for admin approval and webhook functionality in a real environment
  // with appropriate permissions and mocked external services
});
