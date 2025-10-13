const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Load environment variables from env.json if not already set
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, 'env.json');
if (fs.existsSync(envPath)) {
  const envConfig = require('./env.json');
  Object.keys(envConfig).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = String(envConfig[key]);
    }
  });
  logger.info('Environment variables loaded from env.json');
}

// Import all schemas to ensure they are registered
const accountSchema = require('./src/models/account.schema');
const accountTransactionSchema = require('./src/models/accountTransaction.schema');
const bannerSchema = require('./src/models/banner.schema');
const branchSchema = require('./src/models/branch.schema');
const branchStaffSchema = require('./src/models/branchStaff.schema');
const cartSchema = require('./src/models/cart.schema');
const collectionSchema = require('./src/models/collections.schema');
const categorySchema = require('./src/models/category.schema');
const cartItemSchema = require('./src/models/cartItem.schema');
const contributionSchema = require('./src/models/contribution.schema');
const brandSchema = require('./src/models/brand.schema');
const customerSchema = require('./src/models/customer.schema');
const dailySummarySchema = require('./src/models/dailySummary.schema');
const expenditureSchema = require('./src/models/expenditure.schema');
const fileUploadSchema = require('./src/models/fileUpload.schema');
const ledgerSchema = require('./src/models/ledger.schema');
const merchantAdminSchema = require('./src/models/merchantAdmin.schema');
const merchantRequestSchema = require('./src/models/merchantRequest.schema');
const notificationSchema = require('./src/models/notification.schema');
const optSchema = require('./src/models/otp.schema');
const packageSchema = require('./src/models/dsPackage.schema');
const permissionSchema = require('./src/models/permission.schema');
const productSchema = require('./src/models/product.schema');
const productCatalogueSchema = require('./src/models/productCatalogue.schema');
const productCollectionSchema = require('./src/models/productCollection.schema');
const promotionSchema = require('./src/models/promotion.schema');
const productRequestSchema = require('./src/models/productRequest.schema');
const roleSchema = require('./src/models/role.schema');
const rolePermissionSchema = require('./src/models/rolePermission.schema');
const saleSchema = require('./src/models/sales.schema');
const salesItemSchema = require('./src/models/salesItem.schema');
const sbPackageSchema = require('./src/models/sbPackage.schema');
const tokenSchema = require('./src/models/token.schema');
const userSchema = require('./src/models/user.schema');
const userRoleSchema = require('./src/models/userRole.schema');
const notificationPreferenceSchema = require('./src/models/notificationPreference.schema');
const interestPackageSchema = require('./src/models/interestPackage.schema');
const merchantSchema = require('./src/models/merchant.schema');
const chargeSchema = require('./src/models/charge.schema');
const orderSchema = require('./src/models/order.schema');
const noteKeepingSchema = require('./src/models/noteKeeping.schema');
const paymentTransactionSchema = require('./src/models/paymentTransaction.schema');
const withdrawalRequestSchema = require('./src/models/withdrawalRequest.schema');
const kycSchema = require('./src/models/kyc.schema');
const storedCardSchema = require('./src/models/storedCard.schema');
const scheduledContributionSchema = require('./src/models/scheduledContribution.schema');
const scheduledPaymentLogSchema = require('./src/models/scheduledPaymentLog.schema');
const emailSuppressionSchema = require('./src/models/emailSuppression.schema');
const emailEventSchema = require('./src/models/emailEvent.schema');

// Track if models have been registered
let modelsRegistered = false;

/**
 * Register all models with mongoose connection
 */
function registerModels() {
  if (modelsRegistered) {
    logger.info('Models already registered, skipping...');
    return;
  }

  try {
    // Register all models
    mongoose.model('Account', accountSchema);
    mongoose.model('AccountTransaction', accountTransactionSchema);
    mongoose.model('Banner', bannerSchema);
    mongoose.model('Branch', branchSchema);
    mongoose.model('BranchStaff', branchStaffSchema);
    mongoose.model('Brand', brandSchema);
    mongoose.model('Cart', cartSchema);
    mongoose.model('CartItem', cartItemSchema);
    mongoose.model('Category', categorySchema);
    mongoose.model('Collection', collectionSchema);
    mongoose.model('Contribution', contributionSchema);
    mongoose.model('Customer', customerSchema);
    mongoose.model('DailySummary', dailySummarySchema);
    mongoose.model('Expenditure', expenditureSchema);
    mongoose.model('FileUpload', fileUploadSchema);
    mongoose.model('Ledger', ledgerSchema);
    mongoose.model('MerchantAdmin', merchantAdminSchema);
    mongoose.model('MerchantRequest', merchantRequestSchema);
    mongoose.model('Notification', notificationSchema);
    mongoose.model('Opt', optSchema);
    mongoose.model('Package', packageSchema);
    mongoose.model('Permission', permissionSchema);
    mongoose.model('Product', productSchema);
    mongoose.model('ProductCatalogue', productCatalogueSchema);
    mongoose.model('ProductCollection', productCollectionSchema);
    mongoose.model('ProductRequest', productRequestSchema);
    mongoose.model('Promotion', promotionSchema);
    mongoose.model('Role', roleSchema);
    mongoose.model('RolePermission', rolePermissionSchema);
    mongoose.model('Sales', saleSchema);
    mongoose.model('SalesItem', salesItemSchema);
    mongoose.model('SbPackage', sbPackageSchema);
    mongoose.model('Token', tokenSchema);
    mongoose.model('User', userSchema);
    mongoose.model('UserRoles', userRoleSchema);
    mongoose.model('NotificationPreference', notificationPreferenceSchema);
    mongoose.model('InterestPackage', interestPackageSchema);
    mongoose.model('Merchant', merchantSchema);
    mongoose.model('Charge', chargeSchema);
    mongoose.model('Order', orderSchema);
    mongoose.model('NoteKeeping', noteKeepingSchema);
    mongoose.model('PaymentTransaction', paymentTransactionSchema);
    mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
    mongoose.model('KYC', kycSchema);
    mongoose.model('StoredCard', storedCardSchema);
    mongoose.model('ScheduledContribution', scheduledContributionSchema);
    mongoose.model('ScheduledPaymentLog', scheduledPaymentLogSchema);
    mongoose.model('EmailSuppression', emailSuppressionSchema);
    mongoose.model('EmailEvent', emailEventSchema);

    // Ensure DsPackage is properly registered
    mongoose.model('DsPackage', packageSchema);

    modelsRegistered = true;
    logger.info('All models registered successfully with mongoose connection');
  } catch (error) {
    // If models are already registered (error thrown), that's okay
    if (error.name === 'OverwriteModelError') {
      logger.info('Models already exist on mongoose, skipping registration');
      modelsRegistered = true;
    } else {
      logger.error('Error registering models:', error);
      throw error;
    }
  }
}

// Initialize application
async function initialize() {
  try {
    logger.info('Starting application...');

    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Register all models after connection
    registerModels();

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

// Initialize on startup
initialize().catch((error) => {
  logger.error('Startup failed:', error);
  process.exit(1);
});

module.exports.handler = serverless(app);

// Serverless function for processing scheduled contributions
// This will be called by AWS EventBridge on a schedule
module.exports.processScheduledContributions = async (event, context) => {
  try {
    logger.info('Processing scheduled contributions via Lambda function');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoose.url, config.mongoose.options);
      logger.info('Connected to MongoDB for scheduled processing');
    }

    // Ensure models are registered
    registerModels();
    
    const scheduledContributionService = require('./src/services/scheduledContribution.service');
    
    // Get all due scheduled contributions
    const dueContributions = await scheduledContributionService.getDueScheduledContributions();
    
    if (dueContributions.length === 0) {
      logger.info('No due scheduled contributions found');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No due contributions',
          processed: 0,
        }),
      };
    }

    logger.info(`Found ${dueContributions.length} due scheduled contributions`);
    
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // Process each due contribution
    for (const contribution of dueContributions) {
      try {
        processedCount++;
        logger.info(`Processing scheduled contribution ${contribution._id} for user ${contribution.userId}`, {
          contributionType: contribution.contributionType,
          amount: contribution.amount,
          frequency: contribution.frequency,
          storedCardPopulated: !!contribution.storedCardId && typeof contribution.storedCardId === 'object'
        });
        
        const result = await scheduledContributionService.processScheduledPayment(contribution);
        
        if (result.success) {
          successCount++;
          logger.info(`Successfully processed contribution ${contribution._id}: ${result.message}`);
        } else {
          failedCount++;
          logger.warn(`Failed to process contribution ${contribution._id}: ${result.message}`);
        }
        
        results.push({
          contributionId: contribution._id,
          userId: contribution.userId,
          success: result.success,
          message: result.message,
          error: result.error || null,
          suspended: result.suspended || false,
        });
        
      } catch (error) {
        failedCount++;
        logger.error(`Error processing contribution ${contribution._id}:`, error);
        
        results.push({
          contributionId: contribution._id,
          userId: contribution.userId,
          success: false,
          message: error.message,
          error: 'PROCESSING_ERROR',
          suspended: false,
        });
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalFound: dueContributions.length,
      totalProcessed: processedCount,
      successCount,
      failedCount,
      results,
    };

    logger.info('Completed scheduled contributions processing:', {
      total: dueContributions.length,
      processed: processedCount,
      success: successCount,
      failed: failedCount,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    };
    
  } catch (error) {
    logger.error('Fatal error in scheduled contributions Lambda function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
