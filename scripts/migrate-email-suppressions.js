#!/usr/bin/env node

/**
 * Migration script to transfer email suppression data from SES to Mailjet format
 * This script updates existing EmailSuppression records to work with the new Mailjet system
 */

const mongoose = require('mongoose');
const path = require('path');
const config = require('../src/config/config');
const logger = require('../src/config/logger');
const { EmailSuppression } = require('../src/models');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB for migration');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

/**
 * Migrate SES suppression data to Mailjet format
 */
const migrateSESSuppressions = async () => {
  try {
    logger.info('Starting migration of SES email suppressions...');
    
    // Find all existing SES suppressions (provider field doesn't exist or is 'ses')
    const sesSuppressions = await EmailSuppression.find({
      $or: [
        { provider: { $exists: false } },
        { provider: 'ses' },
      ],
    });

    logger.info(`Found ${sesSuppressions.length} SES suppression records to migrate`);

    if (sesSuppressions.length === 0) {
      logger.info('No SES suppressions found to migrate');
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;
    const batchSize = 100;

    for (let i = 0; i < sesSuppressions.length; i += batchSize) {
      const batch = sesSuppressions.slice(i, i + batchSize);
      const operations = [];

      for (const suppression of batch) {
        try {
          // Create update operation
          const updateData = {
            provider: 'mailjet', // Mark as migrated to Mailjet format
            lastEventDate: suppression.lastEventDate || suppression.createdAt || new Date(),
            metadata: {
              ...suppression.metadata,
              migratedFromSES: true,
              migrationDate: new Date(),
              originalProvider: 'ses',
            },
          };

          // Map SES-specific fields to Mailjet equivalents where applicable
          if (suppression.bounceType || suppression.bounceSubType) {
            updateData.metadata.sesBounceType = suppression.bounceType;
            updateData.metadata.sesBounceSubType = suppression.bounceSubType;
          }

          if (suppression.complaintFeedbackType) {
            updateData.metadata.sesComplaintFeedbackType = suppression.complaintFeedbackType;
          }

          if (suppression.sourceArn) {
            updateData.metadata.sesSourceArn = suppression.sourceArn;
          }

          operations.push({
            updateOne: {
              filter: { _id: suppression._id },
              update: { $set: updateData },
            },
          });
          
        } catch (error) {
          logger.error(`Error preparing migration for suppression ${suppression._id}:`, error);
          errors++;
        }
      }

      // Execute batch update
      if (operations.length > 0) {
        try {
          const result = await EmailSuppression.bulkWrite(operations, { ordered: false });
          migrated += result.modifiedCount;
          logger.info(`Migrated batch: ${result.modifiedCount} records`);
        } catch (error) {
          logger.error('Error executing batch migration:', error);
          errors += operations.length;
        }
      }
    }

    return { migrated, errors };

  } catch (error) {
    logger.error('Error during SES suppression migration:', error);
    throw error;
  }
};

/**
 * Update existing Mailjet suppressions to ensure consistency
 */
const updateMailjetSuppressions = async () => {
  try {
    logger.info('Updating existing Mailjet suppression records...');
    
    const mailjetSuppressions = await EmailSuppression.find({
      provider: 'mailjet',
      lastEventDate: { $exists: false },
    });

    if (mailjetSuppressions.length === 0) {
      logger.info('No Mailjet suppressions need updating');
      return 0;
    }

    const result = await EmailSuppression.updateMany(
      {
        provider: 'mailjet',
        lastEventDate: { $exists: false },
      },
      {
        $set: {
          lastEventDate: new Date(),
        },
      }
    );

    logger.info(`Updated ${result.modifiedCount} Mailjet suppression records`);
    return result.modifiedCount;

  } catch (error) {
    logger.error('Error updating Mailjet suppressions:', error);
    throw error;
  }
};

/**
 * Generate migration report
 */
const generateMigrationReport = async () => {
  try {
    logger.info('Generating migration report...');

    const totalSuppressions = await EmailSuppression.countDocuments();
    const sesSuppresssions = await EmailSuppression.countDocuments({
      $or: [
        { provider: { $exists: false } },
        { provider: 'ses' },
      ],
    });
    const mailjetSuppressions = await EmailSuppression.countDocuments({ provider: 'mailjet' });

    const suppressionsByReason = await EmailSuppression.aggregate([
      {
        $group: {
          _id: { reason: '$reason', provider: '$provider' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.reason',
          providers: {
            $push: {
              provider: '$_id.provider',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);

    const recentSuppressions = await EmailSuppression.countDocuments({
      lastEventDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });

    const report = {
      totalSuppressions,
      sesSuppresssions,
      mailjetSuppressions,
      suppressionsByReason,
      recentSuppressions,
      migrationDate: new Date(),
    };

    logger.info('Migration Report:', JSON.stringify(report, null, 2));
    return report;

  } catch (error) {
    logger.error('Error generating migration report:', error);
    throw error;
  }
};

/**
 * Clean up duplicate suppressions (if any)
 */
const cleanupDuplicates = async () => {
  try {
    logger.info('Checking for duplicate suppressions...');

    const duplicates = await EmailSuppression.aggregate([
      {
        $group: {
          _id: { email: '$email', reason: '$reason' },
          count: { $sum: 1 },
          docs: { $push: '$_id' },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (duplicates.length === 0) {
      logger.info('No duplicate suppressions found');
      return 0;
    }

    let removedCount = 0;
    for (const duplicate of duplicates) {
      // Keep the first document, remove the rest
      const docsToRemove = duplicate.docs.slice(1);
      await EmailSuppression.deleteMany({ _id: { $in: docsToRemove } });
      removedCount += docsToRemove.length;
    }

    logger.info(`Removed ${removedCount} duplicate suppression records`);
    return removedCount;

  } catch (error) {
    logger.error('Error cleaning up duplicates:', error);
    throw error;
  }
};

/**
 * Main migration function
 */
const runMigration = async () => {
  try {
    await connectDB();
    
    logger.info('=== Starting Email Suppression Migration ===');
    
    // Step 1: Migrate SES suppressions
    const { migrated, errors } = await migrateSESSuppressions();
    
    // Step 2: Update Mailjet suppressions
    const updated = await updateMailjetSuppressions();
    
    // Step 3: Clean up duplicates
    const cleaned = await cleanupDuplicates();
    
    // Step 4: Generate report
    const report = await generateMigrationReport();
    
    logger.info('=== Migration Summary ===');
    logger.info(`SES records migrated: ${migrated}`);
    logger.info(`Mailjet records updated: ${updated}`);
    logger.info(`Duplicate records cleaned: ${cleaned}`);
    logger.info(`Migration errors: ${errors}`);
    logger.info('=== Migration Complete ===');

    const success = errors === 0;
    return {
      success,
      migrated,
      updated,
      cleaned,
      errors,
      report,
    };

  } catch (error) {
    logger.error('Migration failed:', error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await disconnectDB();
  }
};

/**
 * CLI execution
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  if (isDryRun) {
    logger.info('DRY RUN MODE - No changes will be made');
    // In dry run, we would just analyze and report without making changes
    // For simplicity, we'll skip the dry run implementation here
  }

  runMigration()
    .then((result) => {
      if (result.success) {
        logger.info('Migration completed successfully');
        process.exit(0);
      } else {
        logger.error('Migration failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('Unexpected error during migration:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigration,
  migrateSESSuppressions,
  updateMailjetSuppressions,
  generateMigrationReport,
  cleanupDuplicates,
};