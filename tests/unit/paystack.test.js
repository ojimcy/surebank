const httpStatus = require('http-status');
const paystackService = require('../../src/services/paystack.service');
const config = require('../../src/config/config');

describe('Paystack Service', () => {
  describe('Configuration', () => {
    test('should have valid public and secret keys', () => {
      expect(config.paystack.publicKey).toBeDefined();
      expect(config.paystack.publicKey).not.toBe('');
      expect(config.paystack.secretKey).toBeDefined();
      expect(config.paystack.secretKey).not.toBe('');
    });

    test('should initialize Paystack client with secret key', () => {
      expect(paystackService.paystackClient).toBeDefined();
    });
  });

  describe('API Integration', () => {
    test('verifyPaystackInitialization should handle successful API response', async () => {
      // Mock the Paystack API call
      const mockResponse = { status: true, data: [{ name: 'Test Bank' }] };
      paystackService.paystackClient.misc.listBanks = jest.fn().mockResolvedValue(mockResponse);

      const result = await paystackService.verifyPaystackInitialization();
      expect(result).toBe(true);
      expect(paystackService.paystackClient.misc.listBanks).toHaveBeenCalledWith({ country: 'nigeria' });
    });

    test('verifyPaystackInitialization should handle API failure', async () => {
      // Mock a failed API call
      paystackService.paystackClient.misc.listBanks = jest.fn().mockRejectedValue(new Error('API Error'));

      const result = await paystackService.verifyPaystackInitialization();
      expect(result).toBe(false);
    });

    test('initializeTransaction should call Paystack API correctly', async () => {
      const mockData = {
        email: 'test@example.com',
        amount: 10000, // 100 Naira in kobo
        reference: 'test-reference',
      };
      const mockResponse = { status: true, data: { authorization_url: 'https://checkout.paystack.com/test' } };
      
      paystackService.paystackClient.transaction.initialize = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await paystackService.initializeTransaction(mockData);
      
      expect(paystackService.paystackClient.transaction.initialize).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockResponse);
    });
  });
});
