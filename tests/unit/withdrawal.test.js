const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { WithdrawalRequest } = require('../../src/models');
const {
  withdrawalService,
  accountTransactionService,
  userService,
  paystackService,
  notificationService,
} = require('../../src/services');
const ApiError = require('../../src/utils/ApiError');
const setupTestDB = require('../utils/setupTestDB');

// Setup the in-memory database for testing
setupTestDB();

// Mock dependencies
jest.mock('../../src/services/accountTransaction.service');
jest.mock('../../src/services/user.service');
jest.mock('../../src/services/paystack.service');
jest.mock('../../src/services/notification.service');
jest.mock('../../src/config/logger');

describe('Withdrawal Service', () => {
  let mockUserId;
  let mockAccount;
  let mockUser;
  let mockAccountManager;
  let mockWithdrawalRequest;
  let mockTransferResponse;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock data
    mockUserId = mongoose.Types.ObjectId();
    const mockPackageId = mongoose.Types.ObjectId();
    const mockAccountManagerId = mongoose.Types.ObjectId();

    mockAccount = {
      _id: mongoose.Types.ObjectId(),
      accountNumber: '12345678',
      userId: mockUserId,
      packageId: mockPackageId,
      accountType: 'ds',
      accountManagerId: mockAccountManagerId,
    };

    mockUser = {
      _id: mockUserId,
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      phone: '1234567890',
    };

    mockAccountManager = {
      _id: mockAccountManagerId,
      firstName: 'Account',
      lastName: 'Manager',
      email: 'manager@example.com',
    };

    mockWithdrawalRequest = {
      _id: mongoose.Types.ObjectId(),
      userId: mockUserId,
      packageId: mockPackageId,
      packageType: 'DsPackage',
      accountNumber: '12345678',
      amount: 5000,
      requestedAmount: 5000,
      bankAccountName: 'Test User',
      bankAccountNumber: '0123456789',
      bankName: 'Test Bank',
      bankCode: '057',
      status: 'pending',
      requestedBy: mockUserId,
      save: jest.fn().mockResolvedValue(true),
    };

    mockTransferResponse = {
      status: true,
      data: {
        reference: 'transfer-ref-123',
        recipient_code: 'rec-123',
        transfer_code: 'transfer-123',
      },
    };

    // Setup common mocks
    accountTransactionService.getAccountByNumber.mockResolvedValue(mockAccount);
    accountTransactionService.getAvailableBalance.mockResolvedValue(10000);
    userService.getUserById.mockImplementation((id) => {
      if (id.toString() === mockUserId.toString()) {
        return Promise.resolve(mockUser);
      }
      if (id.toString() === mockAccountManagerId.toString()) {
        return Promise.resolve(mockAccountManager);
      }
      return Promise.resolve(null);
    });
    notificationService.sendMultiChannelNotification.mockResolvedValue({});

    // Mock Mongoose methods
    jest.spyOn(WithdrawalRequest, 'create').mockImplementation(() => {
      return Promise.resolve([mockWithdrawalRequest]);
    });
    jest.spyOn(WithdrawalRequest, 'findById').mockImplementation(() => {
      return Promise.resolve(mockWithdrawalRequest);
    });
    jest.spyOn(mongoose, 'startSession').mockImplementation(() => ({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(true),
      abortTransaction: jest.fn().mockResolvedValue(true),
      endSession: jest.fn(),
    }));
  });

  describe('createSelfWithdrawalRequest', () => {
    test('should create a withdrawal request successfully', async () => {
      // Setup test data
      const withdrawalData = {
        userId: mockUserId,
        accountNumber: '12345678',
        amount: 5000,
        bankAccountName: 'Test User',
        bankAccountNumber: '0123456789',
        bankName: 'Test Bank',
        bankCode: '057',
        reason: 'Need cash',
      };

      // Execute
      const result = await withdrawalService.createSelfWithdrawalRequest(withdrawalData);

      // Assert
      expect(accountTransactionService.getAccountByNumber).toHaveBeenCalledWith('12345678');
      expect(accountTransactionService.getAvailableBalance).toHaveBeenCalledWith('12345678');
      expect(WithdrawalRequest.create).toHaveBeenCalled();
      expect(accountTransactionService.putAmountOnHold).toHaveBeenCalledWith('12345678', 5000);
      expect(notificationService.sendMultiChannelNotification).toHaveBeenCalled();
      expect(result).toEqual(mockWithdrawalRequest);
    });

    test('should throw error if account not found', async () => {
      // Setup
      accountTransactionService.getAccountByNumber.mockResolvedValue(null);

      // Execute and Assert
      await expect(
        withdrawalService.createSelfWithdrawalRequest({
          userId: mockUserId,
          accountNumber: 'invalid',
          amount: 5000,
        })
      ).rejects.toThrow(ApiError);
    });

    test('should throw error if insufficient funds', async () => {
      // Setup
      accountTransactionService.getAvailableBalance.mockResolvedValue(1000);

      // Execute and Assert
      await expect(
        withdrawalService.createSelfWithdrawalRequest({
          userId: mockUserId,
          accountNumber: '12345678',
          amount: 5000,
        })
      ).rejects.toThrow(ApiError);
    });

    test('should throw error if not account owner', async () => {
      // Setup
      const differentUserId = mongoose.Types.ObjectId();

      // Execute and Assert
      await expect(
        withdrawalService.createSelfWithdrawalRequest({
          userId: differentUserId,
          accountNumber: '12345678',
          amount: 5000,
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('approveWithdrawalRequest', () => {
    beforeEach(() => {
      paystackService.createTransferRecipient.mockResolvedValue({
        data: {
          recipient_code: 'rec-123',
        },
      });

      paystackService.initiateTransfer.mockResolvedValue(mockTransferResponse);
    });

    test('should approve withdrawal request and initiate transfer', async () => {
      const approvedById = mongoose.Types.ObjectId();
      const requestId = mockWithdrawalRequest._id;

      const result = await withdrawalService.approveWithdrawalRequest(requestId, approvedById);

      expect(WithdrawalRequest.findById).toHaveBeenCalledWith(requestId);
      expect(mockWithdrawalRequest.status).toBe('processing');
      expect(mockWithdrawalRequest.approvedBy).toEqual(approvedById);
      expect(mockWithdrawalRequest.approvedAt).toBeDefined();
      expect(mockWithdrawalRequest.transferReference).toBe('transfer-ref-123');
      expect(paystackService.createTransferRecipient).toHaveBeenCalled();
      expect(paystackService.initiateTransfer).toHaveBeenCalled();
      expect(notificationService.sendMultiChannelNotification).toHaveBeenCalled();
      expect(result.withdrawalRequest).toBe(mockWithdrawalRequest);
      expect(result.transfer).toEqual(mockTransferResponse);
    });

    test('should handle Paystack transfer failure', async () => {
      // Setup
      paystackService.initiateTransfer.mockRejectedValue(new Error('Transfer failed'));

      // Execute and Assert
      await expect(
        withdrawalService.approveWithdrawalRequest(mockWithdrawalRequest._id, mongoose.Types.ObjectId())
      ).rejects.toThrow(ApiError);

      expect(mockWithdrawalRequest.status).toBe('failed');
      expect(accountTransactionService.moveHeldAmountToAvailable).toHaveBeenCalledWith(
        mockWithdrawalRequest.accountNumber,
        mockWithdrawalRequest.amount
      );
    });

    test('should throw error if withdrawal request not found', async () => {
      // Setup
      WithdrawalRequest.findById.mockResolvedValue(null);

      // Execute and Assert
      await expect(
        withdrawalService.approveWithdrawalRequest(mongoose.Types.ObjectId(), mongoose.Types.ObjectId())
      ).rejects.toThrow(ApiError);
    });

    test('should throw error if withdrawal request already processed', async () => {
      // Setup
      const processedRequest = {
        ...mockWithdrawalRequest,
        status: 'approved',
      };
      WithdrawalRequest.findById.mockResolvedValue(processedRequest);

      // Execute and Assert
      await expect(
        withdrawalService.approveWithdrawalRequest(processedRequest._id, mongoose.Types.ObjectId())
      ).rejects.toThrow(ApiError);
    });
  });

  describe('processTransferWebhook', () => {
    beforeEach(() => {
      jest.spyOn(WithdrawalRequest, 'findOne').mockImplementation(() => {
        return Promise.resolve(mockWithdrawalRequest);
      });
    });

    test('should process successful transfer webhook', async () => {
      // Setup
      const webhookEvent = {
        event: 'transfer.success',
        data: {
          reference: 'transfer-ref-123',
        },
      };

      // Execute
      const result = await withdrawalService.processTransferWebhook(webhookEvent);

      // Assert
      expect(WithdrawalRequest.findOne).toHaveBeenCalledWith({ transferReference: 'transfer-ref-123' });
      expect(mockWithdrawalRequest.status).toBe('processed');
      expect(accountTransactionService.spendHeldAmount).toHaveBeenCalledWith(
        mockWithdrawalRequest.accountNumber,
        mockWithdrawalRequest.amount
      );
      expect(notificationService.sendMultiChannelNotification).toHaveBeenCalled();
      expect(result).toEqual({ processed: true, status: 'success' });
    });

    test('should process failed transfer webhook', async () => {
      // Setup
      const webhookEvent = {
        event: 'transfer.failed',
        data: {
          reference: 'transfer-ref-123',
          reason: 'Insufficient funds',
        },
      };

      // Execute
      const result = await withdrawalService.processTransferWebhook(webhookEvent);

      // Assert
      expect(WithdrawalRequest.findOne).toHaveBeenCalledWith({ transferReference: 'transfer-ref-123' });
      expect(mockWithdrawalRequest.status).toBe('failed');
      expect(mockWithdrawalRequest.rejectionReason).toBe('Insufficient funds');
      expect(accountTransactionService.moveHeldAmountToAvailable).toHaveBeenCalledWith(
        mockWithdrawalRequest.accountNumber,
        mockWithdrawalRequest.amount
      );
      expect(notificationService.sendMultiChannelNotification).toHaveBeenCalled();
      expect(result).toEqual({ processed: true, status: 'failed' });
    });

    test('should handle unknown transfer reference', async () => {
      // Setup
      WithdrawalRequest.findOne.mockResolvedValue(null);
      const webhookEvent = {
        event: 'transfer.success',
        data: {
          reference: 'unknown-ref',
        },
      };

      // Execute
      const result = await withdrawalService.processTransferWebhook(webhookEvent);

      // Assert
      expect(WithdrawalRequest.findOne).toHaveBeenCalledWith({ transferReference: 'unknown-ref' });
      expect(result).toEqual({ processed: false, reason: 'Unknown reference' });
    });

    test('should ignore non-transfer events', async () => {
      // Setup
      const webhookEvent = {
        event: 'charge.success',
        data: {},
      };

      // Execute
      const result = await withdrawalService.processTransferWebhook(webhookEvent);

      // Assert
      expect(result).toEqual({ processed: false, reason: 'Not a transfer event' });
    });
  });
});
