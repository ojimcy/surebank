/**
 * Payment service helper functions
 */

/**
 * Create payment metadata based on contribution type
 * @param {string} userId - User ID
 * @param {string} packageId - Package ID
 * @param {Object} packageData - Package data
 * @param {string} contributionType - Contribution type
 * @returns {Object} Metadata for Paystack
 */
const createPaymentMetadata = (userId, packageId, packageData, contributionType) => {
  // Base metadata fields
  const metadata = {
    userId,
    isMobileApp: packageData.isMobileApp || false,
  };

  // Add contribution-specific fields
  switch (contributionType) {
    case 'daily_savings':
      return {
        ...metadata,
        packageId,
        contributionType: 'ds', // 'ds' for Daily Savings in Paystack metadata
      };

    case 'savings_buying':
      return {
        ...metadata,
        packageId,
        contributionType: 'sb', // 'sb' for Savings Buying in Paystack metadata
      };

    case 'interest_package':
      return {
        ...metadata,
        contributionType: 'interest_savings',
        isPackagePending: true,
        name: packageData.name,
        principalAmount: packageData.principalAmount,
        lockPeriod: packageData.lockPeriod,
        earlyWithdrawalPenalty: packageData.earlyWithdrawalPenalty || 50,
        interestRate: packageData.interestRate,
      };

    default:
      return {
        ...metadata,
        contributionType: 'unknown',
      };
  }
};

module.exports = { createPaymentMetadata };
