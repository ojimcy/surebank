/**
 * Script to calculate interest for all active interest-based packages
 * This script MUST be scheduled to run DAILY to ensure users see their balance grow each day
 * It calculates simple interest (no compounding) for each active package
 */

const { interestPackageService } = require('../services');
const logger = require('../config/logger');

const calculateAllInterest = async () => {
  logger.info('Starting daily interest calculation for all active packages');

  try {
    // Update all active packages with daily interest
    const updatedCount = await interestPackageService.updateAllActivePackagesInterest();

    logger.info(`Daily interest calculation completed for ${updatedCount} packages`);

    return { success: true, packagesUpdated: updatedCount };
  } catch (error) {
    logger.error('Error during interest calculation:', error);
    return { success: false, error: error.message };
  }
};

// Export for use with scheduler
module.exports = calculateAllInterest;
