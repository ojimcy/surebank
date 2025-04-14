// Mock User model for tests
class User {
  constructor(userData) {
    Object.assign(this, userData);
    this.isPasswordMatch = jest.fn().mockResolvedValue(true);
  }

  validate() {
    // Basic validation
    if (!this.email || !this.email.includes('@')) {
      return Promise.reject(new Error('Invalid email'));
    }
    if (!this.password || this.password.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters'));
    }
    if (!/\d/.test(this.password)) {
      return Promise.reject(new Error('Password must contain at least one number'));
    }
    if (!/[a-zA-Z]/.test(this.password)) {
      return Promise.reject(new Error('Password must contain at least one letter'));
    }
    if (this.role && !['user', 'admin', 'vendor', 'userReps', 'manager', 'superAdmin'].includes(this.role)) {
      return Promise.reject(new Error('Invalid role'));
    }
    return Promise.resolve();
  }

  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    return userObject;
  }
}

User.schema = {
  pre: jest.fn().mockImplementation((_, callback) => callback()),
};

User.findById = jest.fn().mockImplementation((id) => {
  return {
    exec: jest.fn().mockResolvedValue({
      _id: id,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      isEmailVerified: false,
    }),
  };
});

User.findOne = jest.fn().mockImplementation(() => {
  return {
    exec: jest.fn().mockResolvedValue(null),
  };
});

module.exports = User;
