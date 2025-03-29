const { encrypt, decrypt } = require('./encryption');
const logger = require('../config/logger');

const createEncryptedField = (options = {}) => {
  const { required = false, validate, ...otherOptions } = options;

  return {
    type: String,
    required,
    ...otherOptions,
    set(value) {
      if (!value) return value;
      try {
        return encrypt(value.toString());
      } catch (error) {
        logger.error('Encryption error:', error);
        throw error;
      }
    },
    get(value) {
      if (!value) return value;
      try {
        return decrypt(value);
      } catch (error) {
        logger.error('Decryption error:', error);
        return value;
      }
    },
    validate: [
      {
        validator(value) {
          if (!value && required) return false;
          if (!value) return true;

          // Decrypt for validation if encrypted
          let decryptedValue = value;
          if (value.includes(':')) {
            try {
              decryptedValue = decrypt(value);
            } catch (error) {
              return false;
            }
          }

          // Run custom validation if provided
          if (validate) {
            return validate(decryptedValue);
          }
          return true;
        },
        message: options.message || 'Validation failed',
      },
    ],
  };
};

module.exports = createEncryptedField;
