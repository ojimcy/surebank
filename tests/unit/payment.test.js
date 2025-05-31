const httpStatus = require('http-status');
const { paymentService } = require('../../src/services');
const paystackService = require('../../src/services/paystack.service');

// Mock the paystackService to avoid actual API calls
jest.mock('../../src/services/paystack.service');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeTransaction', () => {
    test('should initialize a transaction successfully', async () => {
      // Setup mock response
      const mockResponse = {
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/test',
          access_code: 'test_access_code',
          reference: 'test_reference',
        },
      };

      paystackService.initializeTransaction.mockResolvedValue(mockResponse);

      const transactionData = {
        email: 'test@example.com',
        amount: 1000, // 1000 Naira
        callbackUrl: 'https://example.com/callback',
        metadata: { userId: '12345' },
      };

      const result = await paymentService.initializeTransaction(transactionData);

      // Verify Paystack service was called with correct parameters
      expect(paystackService.initializeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          amount: 100000, // Should be converted to kobo (1000 * 100)
          callback_url: 'https://example.com/callback',
          metadata: expect.objectContaining({
            userId: '12345',
            custom_reference: expect.any(String),
          }),
        })
      );

      // Check response structure
      expect(result).toEqual({
        success: true,
        reference: expect.any(String),
        authorizationUrl: 'https://checkout.paystack.com/test',
        accessCode: 'test_access_code',
        paymentData: mockResponse.data,
      });
    });

    test('should handle initialization failure', async () => {
      paystackService.initializeTransaction.mockResolvedValue({ status: false });

      const transactionData = {
        email: 'test@example.com',
        amount: 1000,
      };

      await expect(paymentService.initializeTransaction(transactionData)).rejects.toThrow();
    });
  });

  describe('verifyTransaction', () => {
    test('should verify a successful transaction', async () => {
      const mockResponse = {
        status: true,
        data: {
          status: 'success',
          reference: 'test_reference',
          amount: 100000, // Amount in kobo
          customer: {
            email: 'test@example.com',
          },
        },
      };

      paystackService.verifyTransaction.mockResolvedValue(mockResponse);

      const result = await paymentService.verifyTransaction('test_reference');

      expect(paystackService.verifyTransaction).toHaveBeenCalledWith('test_reference');

      expect(result).toEqual({
        success: true,
        verified: true,
        status: 'success',
        amount: 1000, // Should be converted back to Naira
        reference: 'test_reference',
        transactionData: mockResponse.data,
      });
    });

    test('should handle verification failure', async () => {
      paystackService.verifyTransaction.mockResolvedValue({ status: false });

      await expect(paymentService.verifyTransaction('invalid_reference')).rejects.toThrow();
    });

    test('should throw error when reference is missing', async () => {
      await expect(paymentService.verifyTransaction()).rejects.toThrow();
    });
  });

  describe('getTransactionHistory', () => {
    test('should return formatted transaction history', async () => {
      const mockResponse = {
        status: true,
        data: {
          data: [
            {
              id: 1,
              reference: 'ref_1',
              amount: 100000, // Amount in kobo
              status: 'success',
              customer: {
                email: 'customer1@example.com',
                first_name: 'John',
                last_name: 'Doe',
              },
              created_at: '2023-01-01T00:00:00Z',
              paid_at: '2023-01-01T00:01:00Z',
            },
          ],
          meta: {
            total: 1,
            perPage: 10,
            page: 1,
          },
        },
      };

      paystackService.listTransactions.mockResolvedValue(mockResponse);

      const result = await paymentService.getTransactionHistory({ page: 1, perPage: 10 });

      expect(paystackService.listTransactions).toHaveBeenCalledWith({ page: 1, perPage: 10 });

      expect(result).toEqual({
        success: true,
        transactions: [
          {
            id: 1,
            reference: 'ref_1',
            amount: 1000, // Converted to Naira
            status: 'success',
            customer: {
              email: 'customer1@example.com',
              name: 'John Doe',
            },
            createdAt: '2023-01-01T00:00:00Z',
            paidAt: '2023-01-01T00:01:00Z',
          },
        ],
        meta: {
          total: 1,
          totalPages: 1,
          perPage: 10,
          page: 1,
        },
      });
    });
  });

  describe('createTransferRecipient', () => {
    test('should create a transfer recipient successfully', async () => {
      const mockResponse = {
        status: true,
        data: {
          recipient_code: 'RCP_test123',
          type: 'nuban',
          name: 'John Doe',
          account_number: '0123456789',
          bank_code: '058',
        },
      };

      paystackService.createTransferRecipient.mockResolvedValue(mockResponse);

      const recipientData = {
        name: 'John Doe',
        accountNumber: '0123456789',
        bankCode: '058',
      };

      const result = await paymentService.createTransferRecipient(recipientData);

      expect(paystackService.createTransferRecipient).toHaveBeenCalledWith({
        type: 'nuban',
        name: 'John Doe',
        account_number: '0123456789',
        bank_code: '058',
        currency: 'NGN',
      });

      expect(result).toEqual({
        success: true,
        recipientCode: 'RCP_test123',
        recipientData: mockResponse.data,
      });
    });

    test('should validate required fields', async () => {
      const incompleteData = { name: 'John Doe' };

      await expect(paymentService.createTransferRecipient(incompleteData)).rejects.toThrow();
    });
  });

  describe('initiateTransfer', () => {
    test('should initiate a transfer successfully', async () => {
      const mockResponse = {
        status: true,
        data: {
          transfer_code: 'TRF_test123',
          reference: 'ref_test123',
        },
      };

      paystackService.initiateTransfer.mockResolvedValue(mockResponse);

      const transferData = {
        amount: 1000, // 1000 Naira
        recipientCode: 'RCP_test123',
        reason: 'Test withdrawal',
      };

      const result = await paymentService.initiateTransfer(transferData);

      expect(paystackService.initiateTransfer).toHaveBeenCalledWith({
        source: 'balance',
        amount: 100000, // Should be converted to kobo
        recipient: 'RCP_test123',
        reason: 'Test withdrawal',
      });

      expect(result).toEqual({
        success: true,
        transferCode: 'TRF_test123',
        reference: 'ref_test123',
        transferData: mockResponse.data,
      });
    });

    test('should validate required fields', async () => {
      const incompleteData = { amount: 1000 };

      await expect(paymentService.initiateTransfer(incompleteData)).rejects.toThrow();
    });
  });
});
