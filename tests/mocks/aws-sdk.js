// Mock AWS SDK services for testing
const mockSecretsManager = {
  send: jest.fn().mockResolvedValue({
    SecretString: JSON.stringify({
      certificate: 'mock-certificate',
      username: 'mock-username',
      password: 'mock-password',
    }),
  }),
};

const mockSES = {
  send: jest.fn().mockResolvedValue({
    MessageId: 'mock-message-id',
  }),
};

// Export mocked clients
const SecretsManagerClient = jest.fn().mockImplementation(() => mockSecretsManager);
const SESClient = jest.fn().mockImplementation(() => mockSES);
const SendEmailCommand = jest.fn();
const GetSecretValueCommand = jest.fn();

module.exports = {
  SecretsManagerClient,
  SESClient,
  SendEmailCommand,
  GetSecretValueCommand,
  mockSecretsManager,
  mockSES,
};
