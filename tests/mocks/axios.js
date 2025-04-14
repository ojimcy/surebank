// Mock axios module
const mockResponse = {
  data: {
    success: true,
    data: {},
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
};

// Create mock first without the create method
const axiosMock = {
  get: jest.fn().mockResolvedValue(mockResponse),
  post: jest.fn().mockResolvedValue(mockResponse),
  put: jest.fn().mockResolvedValue(mockResponse),
  delete: jest.fn().mockResolvedValue(mockResponse),
  patch: jest.fn().mockResolvedValue(mockResponse),
  request: jest.fn().mockResolvedValue(mockResponse),
  defaults: {
    baseURL: '',
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

// Add create method after the object is defined
axiosMock.create = jest.fn().mockReturnValue(axiosMock);

module.exports = axiosMock;
