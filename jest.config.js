module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    customExportConditions: ['node', 'node-addons'],
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  moduleNameMapper: {
    '^node:(.*)$': '<rootDir>/node_modules/$1',
    '^@aws-sdk/client-secrets-manager$': '<rootDir>/tests/mocks/aws-sdk.js',
    '^@aws-sdk/client-ses$': '<rootDir>/tests/mocks/aws-sdk.js',
    '^axios$': '<rootDir>/tests/mocks/axios.js',
    '^mongoose$': '<rootDir>/node_modules/mongoose',
    '^../(.*)/user.model$': '<rootDir>/tests/mocks/user.model.js',
    '^../../src/models/user.model$': '<rootDir>/tests/mocks/user.model.js',
    '^../models/user.model$': '<rootDir>/tests/mocks/user.model.js',
    '^src/models/user.model$': '<rootDir>/tests/mocks/user.model.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(@smithy|@aws-sdk)/)'],
};
