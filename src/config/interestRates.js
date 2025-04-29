/**
 * Configuration file for interest rates
 * This centralizes interest rate management for better security and control
 */

// Predefined interest rates that are allowed in the system
const ALLOWED_INTEREST_RATES = [
  {
    id: 'monthly',
    rate: 5.0,
    name: '1 Month',
    description: 'Standard interest rate for regular savings',
    minLockPeriod: 30, // minimum lock period in days
    maxLockPeriod: 90, // maximum lock period in days
  },
  {
    id: 'quarterly',
    rate: 7.5,
    name: '3 Months',
    description: 'Higher interest rate for quarterly commitment',
    minLockPeriod: 91,
    maxLockPeriod: 180,
  },
  {
    id: 'semiyearly',
    rate: 9.0,
    name: '6 Months',
    description: 'Enhanced interest rate for medium-term savings',
    minLockPeriod: 181,
    maxLockPeriod: 365,
  },
  {
    id: 'yearly',
    rate: 12.0,
    name: '1 Year',
    description: 'Premium interest rate for yearly commitment',
    minLockPeriod: 366,
    maxLockPeriod: 730,
  },
  {
    id: 'biennial',
    rate: 15.0,
    name: '2 Years',
    description: 'Maximum interest rate for long-term savers',
    minLockPeriod: 731,
    maxLockPeriod: 1095,
  },
];

// Default values for withdrawal penalties
const DEFAULT_EARLY_WITHDRAWAL_PENALTY = 50; // 50% penalty on accrued interest

/**
 * Get the appropriate interest rate based on lock period
 * @param {number} lockPeriod - Lock period in days
 * @returns {Object} Interest rate configuration
 */
const getInterestRateByLockPeriod = (lockPeriod) => {
  return ALLOWED_INTEREST_RATES.find((rate) => lockPeriod >= rate.minLockPeriod && lockPeriod <= rate.maxLockPeriod);
};

/**
 * Validate if the provided interest rate is allowed
 * @param {number} rate - Interest rate to validate
 * @returns {boolean} True if rate is allowed, false otherwise
 */
const isValidInterestRate = (rate) => {
  return ALLOWED_INTEREST_RATES.some((item) => item.rate === rate);
};

/**
 * Get all available interest rate options
 * @returns {Array} List of allowed interest rates
 */
const getAllowedInterestRates = () => {
  return ALLOWED_INTEREST_RATES;
};

module.exports = {
  ALLOWED_INTEREST_RATES,
  DEFAULT_EARLY_WITHDRAWAL_PENALTY,
  getInterestRateByLockPeriod,
  isValidInterestRate,
  getAllowedInterestRates,
};
