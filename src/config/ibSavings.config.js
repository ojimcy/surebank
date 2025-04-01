/**
 * Interest-based savings configuration
 * Contains all configurable values for both fixed and flexible savings packages
 */
const ibSavingsConfig = {
  fixed: {
    interest: {
      '3mo': 20.5,
      '6mo': 21.5,
      '12mo': 22.5,
      '24mo': 25,
    },
    duration: {
      min: 3,
      max: 36,
      yearThreshold: 12,
    },
    deposit: {
      min: 1000,
    },
  },
  flexible: {
    interest: {
      rate: 11.5,
    },
    duration: {
      min: 0.25,
      max: 36,
    },
    deposit: {
      min: 0,
    },
  },
};

module.exports = { ibSavingsConfig };
