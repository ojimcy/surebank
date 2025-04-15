# Paystack Integration Documentation

## Overview
This document describes the implementation of Paystack payment processing in the SureBank backend application. Paystack is used to handle online payments, supporting various payment methods for users of the SureBank platform.

## Configuration

### API Keys
The following Paystack API keys are required for integration:

- **Secret Key**: Used for server-side API calls to Paystack
  - Environment variable: `PAYSTACK_SECRET_KEY`
  - This key should be kept secure and never exposed to clients

- **Public Key**: Used for client-side Paystack integration
  - Environment variable: `PAYSTACK_PUBLIC_KEY`
  - This key can be safely exposed to the client-side code

### Key Storage and Access
API keys are stored securely in the application using environment variables:

1. In development, they are stored in the `.env` file which is ignored by Git
2. In production, they should be stored in a secure environment variable system (AWS Secrets Manager or similar)

The application access to these keys is managed through the `config.js` file which loads them from environment variables and makes them available throughout the application.

### Initialization
The Paystack SDK is initialized in `src/services/paystack.service.js` using the secret key from the configuration. A verification method is provided to test that the integration is working correctly.

## API Operations
The Paystack service provides the following operations:

### 1. Initialize Transaction
Creates a new payment session and returns a checkout URL for the user to complete payment.

```javascript
const response = await paystackService.initializeTransaction({
  email: 'customer@example.com',
  amount: 500000, // Amount in kobo (5,000 Naira)
  reference: 'unique-transaction-ref',
  callback_url: 'https://yourwebsite.com/payment/callback',
});
```

### 2. Verify Transaction
Confirms the status of a transaction after payment attempt.

```javascript
const verification = await paystackService.verifyTransaction(reference);
```

### 3. List Transactions
Retrieves a list of transactions with optional filtering.

```javascript
const transactions = await paystackService.listTransactions({
  perPage: 20,
  page: 1,
});
```

### 4. Create Transfer Recipient
Creates a recipient for transferring funds.

```javascript
const recipient = await paystackService.createTransferRecipient({
  type: 'nuban',
  name: 'John Doe',
  account_number: '0123456789',
  bank_code: '058',
  currency: 'NGN',
});
```

### 5. Initiate Transfer
Transfers funds to a recipient.

```javascript
const transfer = await paystackService.initiateTransfer({
  source: 'balance',
  amount: 500000,
  recipient: recipientCode,
  reason: 'Withdrawal',
});
```

## Testing
The Paystack integration can be tested using:

1. **Unit Tests**: Found in `tests/unit/paystack.test.js`, these tests verify the proper configuration of the Paystack client and mock API responses to test functionality.

2. **Integration Tests**: Manual testing can be performed by initializing a real transaction with a small amount and verifying the payment flow. This should be done in the Paystack test environment.

## Security Considerations
1. Always verify transaction status server-side before providing goods or services
2. Store transaction references for future reference
3. Validate callback responses using the Paystack secret key
4. Never log complete payment details or keys

## Webhook Implementation
For production use, implement Paystack webhooks to receive real-time notifications about transaction events. This requires:

1. Setting up a secure endpoint in the application to receive webhook events
2. Configuring the webhook URL in the Paystack dashboard
3. Validating incoming webhook requests using the request signature

## Troubleshooting
Common issues:
- Failed API connections: Check network connectivity and Paystack API status
- Invalid transaction reference: Ensure unique references for each transaction
- Authentication errors: Verify API keys are correct and not expired
