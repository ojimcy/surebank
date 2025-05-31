const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const { getSecret } = require('../utils/secretsManager');

const accountSchema = require('./account.schema');
const accountTransactionSchema = require('./accountTransaction.schema');
const bannerSchema = require('./banner.schema');
const branchSchema = require('./branch.schema');
const branchStaffSchema = require('./branchStaff.schema');
const cartSchema = require('./cart.schema');
const collectionSchema = require('./collections.schema');
const categorySchema = require('./category.schema');
const cartItemSchema = require('./cartItem.schema');
const contributionSchema = require('./contribution.schema');
const brandSchema = require('./brand.schema');
const customerSchema = require('./customer.schema');
const dailySummarySchema = require('./dailySummary.schema');
const expenditureSchema = require('./expenditure.schema');
const fileUploadSchema = require('./fileUpload.schema');
const ledgerSchema = require('./ledger.schema');
const merchantAdminSchema = require('./merchantAdmin.schema');
const merchantRequestSchema = require('./merchantRequest.schema');
const notificationSchema = require('./notification.schema');
const optSchema = require('./otp.schema');
const packageSchema = require('./dsPackage.schema');
const permissionSchema = require('./permission.schema');
const productSchema = require('./product.schema');
const productCatalogueSchema = require('./productCatalogue.schema');
const productCollectionSchema = require('./productCollection.schema');
const promotionSchema = require('./promotion.schema');
const productRequestSchema = require('./productRequest.schema');
const roleSchema = require('./role.schema');
const rolePermissionSchema = require('./rolePermission.schema');
const saleSchema = require('./sales.schema');
const salesItemSchema = require('./salesItem.schema');
const sbPackageSchema = require('./sbPackage.schema');
const tokenSchema = require('./token.schema');
const userSchema = require('./user.schema');
const userRoleSchema = require('./userRole.schema');
const notificationPreferenceSchema = require('./notificationPreference.schema');
const interestPackageSchema = require('./interestPackage.schema');
const merchantSchema = require('./merchant.schema');
const chargeSchema = require('./charge.schema');
const orderSchema = require('./order.schema');
const noteKeepingSchema = require('./noteKeeping.schema');
const paymentTransactionSchema = require('./paymentTransaction.schema');
const withdrawalRequestSchema = require('./withdrawalRequest.schema');
const kycSchema = require('./kyc.schema');
// Track connection and models
let conn = null;
const models = {};
let isConnecting = false;
let connectionPromise = null;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

/**
 * Register all models with the connection
 */
const registerModels = () => {
  if (!conn) {
    logger.error('Cannot register models - no connection available');
    return false;
  }

  try {
    // Only register models once per connection
    if (Object.keys(models).length === 0) {
      // Schema registration
      models.Account = conn.model('Account', accountSchema);
      models.AccountTransaction = conn.model('AccountTransaction', accountTransactionSchema);
      models.Banner = conn.model('Banner', bannerSchema);
      models.Branch = conn.model('Branch', branchSchema);
      models.BranchStaff = conn.model('BranchStaff', branchStaffSchema);
      models.Brand = conn.model('Brand', brandSchema);
      models.Cart = conn.model('Cart', cartSchema);
      models.CartItem = conn.model('CartItem', cartItemSchema);
      models.Category = conn.model('Category', categorySchema);
      models.Collection = conn.model('Collection', collectionSchema);
      models.Contribution = conn.model('Contribution', contributionSchema);
      models.Customer = conn.model('Customer', customerSchema);
      models.DailySummary = conn.model('DailySummary', dailySummarySchema);
      models.Expenditure = conn.model('Expenditure', expenditureSchema);
      models.FileUpload = conn.model('FileUpload', fileUploadSchema);
      models.Ledger = conn.model('Ledger', ledgerSchema);
      models.MerchantAdmin = conn.model('MerchantAdmin', merchantAdminSchema);
      models.MerchantRequest = conn.model('MerchantRequest', merchantRequestSchema);
      models.Notification = conn.model('Notification', notificationSchema);
      models.Opt = conn.model('Opt', optSchema);
      models.Package = conn.model('Package', packageSchema);
      models.Permission = conn.model('Permission', permissionSchema);
      models.Product = conn.model('Product', productSchema);
      models.ProductCatalogue = conn.model('ProductCatalogue', productCatalogueSchema);
      models.ProductCollection = conn.model('ProductCollection', productCollectionSchema);
      models.ProductRequest = conn.model('ProductRequest', productRequestSchema);
      models.Promotion = conn.model('Promotion', promotionSchema);
      models.Role = conn.model('Role', roleSchema);
      models.RolePermission = conn.model('RolePermission', rolePermissionSchema);
      models.Sales = conn.model('Sales', saleSchema);
      models.SalesItem = conn.model('SalesItem', salesItemSchema);
      models.SbPackage = conn.model('SbPackage', sbPackageSchema);
      models.Token = conn.model('Token', tokenSchema);
      models.User = conn.model('User', userSchema);
      models.UserRoles = conn.model('UserRoles', userRoleSchema);
      models.NotificationPreference = conn.model('NotificationPreference', notificationPreferenceSchema);
      models.InterestPackage = conn.model('InterestPackage', interestPackageSchema);
      models.Merchant = conn.model('Merchant', merchantSchema);
      models.Charge = conn.model('Charge', chargeSchema);
      models.Order = conn.model('Order', orderSchema);
      models.NoteKeeping = conn.model('NoteKeeping', noteKeepingSchema);
      models.PaymentTransaction = conn.model('PaymentTransaction', paymentTransactionSchema);
      models.WithdrawalRequest = conn.model('WithdrawalRequest', withdrawalRequestSchema);
      models.KYC = conn.model('KYC', kycSchema);

      // Ensure DsPackage is properly registered
      models.DsPackage = conn.model('DsPackage', packageSchema);

      // Verify critical models for populate operations
      const criticalModels = ['Branch', 'User', 'Account'];
      const missingModel = criticalModels.find((modelName) => !models[modelName]);
      if (missingModel) {
        logger.error(`Critical model ${missingModel} not registered`);
        return false;
      }

      logger.info('All models registered successfully');
      return true;
    }
    return true;
  } catch (error) {
    logger.error('Error registering models:', error);
    return false;
  }
};

/**
 * Create MongoDB connection with retry mechanism
 */
const createConnection = async (options) => {
  // Prevent multiple concurrent connection attempts
  if (isConnecting) {
    return connectionPromise;
  }

  isConnecting = true;
  let retryCount = 0;

  try {
    // Create new connection promise
    connectionPromise = new Promise((resolve, reject) => {
      try {
        conn = mongoose.createConnection(config.mongoose.url, options);

        // Set up connection event handlers
        conn.on('connected', () => {
          logger.info('MongoDB connected successfully');
          // Register models on successful connection
          registerModels();
          isConnecting = false;
        });

        conn.on('error', (err) => {
          logger.error('MongoDB connection error:', err);
          if (retryCount < MAX_RETRIES) {
            retryCount += 1;
            logger.info(`Retrying connection... Attempt ${retryCount} of ${MAX_RETRIES}`);
            setTimeout(async () => {
              try {
                await createConnection(options);
                resolve(conn);
              } catch (e) {
                reject(e);
              }
            }, RETRY_INTERVAL);
          } else {
            isConnecting = false;
            reject(new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`));
          }
        });

        conn.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
        });

        // Wait for connection to be ready before resolving
        const waitForConnection = () => {
          if (conn.readyState === 1) {
            // Ensure models are registered
            registerModels();
            resolve(conn);
          } else {
            conn.once('connected', () => {
              // Ensure models are registered
              registerModels();
              resolve(conn);
            });
          }
        };

        waitForConnection();
      } catch (error) {
        isConnecting = false;
        reject(error);
      }
    });

    return connectionPromise;
  } catch (error) {
    isConnecting = false;
    logger.error('Error establishing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Get MongoDB connection - creates if doesn't exist
 */
const getConnection = async () => {
  if (!conn || conn.readyState !== 1) {
    let sslCA;

    if (process.env.NODE_ENV === 'production') {
      try {
        sslCA = await getSecret(config.aws.secretName);
      } catch (error) {
        logger.error('Failed to retrieve MongoDB certificate from Secrets Manager:', error);
        throw error;
      }
    }

    const options = {
      ...config.mongoose.options,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 2000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      ...(process.env.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
        sslCA: Buffer.from(sslCA, 'base64'),
      }),
    };

    await createConnection(options);
  }

  // Ensure models are registered every time (safety check for serverless environments)
  if (Object.keys(models).length === 0) {
    registerModels();
  }
  return conn;
};

/**
 * Get a model by name - ensures connection exists and models are registered
 */
const getModel = async (modelName) => {
  await getConnection();

  if (!models[modelName]) {
    throw new Error(`Model ${modelName} not found. Available models: ${Object.keys(models).join(', ')}`);
  }

  return models[modelName];
};

/**
 * Check connection health
 */
const checkConnection = () => {
  if (!conn) return false;
  return conn.readyState === 1;
};

// Export functions
module.exports = {
  getConnection,
  getModel,
  checkConnection,
};
