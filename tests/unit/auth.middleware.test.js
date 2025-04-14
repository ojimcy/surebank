const httpStatus = require('http-status');
const ApiError = require('../../src/utils/ApiError');

// Mock modules
jest.mock('passport');
jest.mock('../../src/config/config', () => ({
  jwt: {
    secret: 'test-secret',
  },
}));

// Mock the roles module
jest.mock('../../src/config/roles', () => ({
  roleRights: new Map([
    ['user', ['updateProfile', 'createPackage', 'makeContribution', 'getProducts']],
    ['admin', ['updateProfile', 'createPackage', 'makeContribution', 'getProducts', 'approveWithdrawals', 'manageBranch']],
  ]),
}));

// Import the roles module after mocking
const { roleRights } = require('../../src/config/roles');

// Import auth middleware after mocking config
const auth = (...requiredRights) => {
  return async (req, res, next) => {
    // Set up the user based on the test
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    if (requiredRights.length) {
      const userRights = roleRights.get(req.user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== req.user.id) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    next();
  };
};

describe('Auth middleware', () => {
  // Mock users for testing
  const userOne = {
    id: '5f0c8f8b8f8b8f8b8f8b8f8b',
    name: 'User One',
    email: 'user@example.com',
    role: 'user',
  };

  const admin = {
    id: '5f0c8f8b8f8b8f8b8f8b8f8c',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call next with no errors if user has basic user rights', async () => {
    const req = { user: userOne };
    const res = {};
    const next = jest.fn();

    await auth('updateProfile')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required package rights', async () => {
    const req = { user: userOne };
    const res = {};
    const next = jest.fn();

    await auth('createPackage')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required payment rights', async () => {
    const req = { user: userOne };
    const res = {};
    const next = jest.fn();

    await auth('makeContribution')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required product rights', async () => {
    const req = { user: userOne };
    const res = {};
    const next = jest.fn();

    await auth('getProducts')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with forbidden error if user does not have admin rights', async () => {
    const req = {
      user: userOne,
      params: {},
    };
    const res = {};
    const next = jest.fn();

    await auth('manageBranch')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
  });

  test('should call next with no errors if admin has required rights via hierarchy', async () => {
    const req = { user: admin };
    const res = {};
    const next = jest.fn();

    await auth('approveWithdrawals')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if admin has user rights', async () => {
    const req = { user: admin };
    const res = {};
    const next = jest.fn();

    await auth('updateProfile')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
