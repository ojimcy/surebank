const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const { getSecret } = require('../utils/secretsManager');

const accountSchema = require('./account.schema');
const accountTransactionSchema = require('./accountTransaction.schema');
const bannerSchema = require('./banner.schema');
const branchSchema = require('./branch.schma');
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

let conn = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const connectWithRetry = async (options) => {
  try {
    conn = mongoose.createConnection(config.mongoose.url, options);

    // Connection event handlers
    conn.on('connected', () => {
      logger.info('MongoDB connected successfully');
      retryCount = 0; // Reset retry count on successful connection
    });

    conn.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      if (retryCount < MAX_RETRIES) {
        retryCount += 1;
        logger.info(`Retrying connection... Attempt ${retryCount} of ${MAX_RETRIES}`);
        setTimeout(() => connectWithRetry(options), RETRY_INTERVAL);
      } else {
        logger.error('Max retry attempts reached. Exiting process.');
        process.exit(1);
      }
    });

    conn.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      if (retryCount < MAX_RETRIES) {
        retryCount += 1;
        logger.info(`Attempting to reconnect... Attempt ${retryCount} of ${MAX_RETRIES}`);
        setTimeout(() => connectWithRetry(options), RETRY_INTERVAL);
      }
    });

    // Monitor connection states
    conn.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      retryCount = 0; // Reset retry count on successful reconnection
    });

    conn.on('close', () => {
      logger.info('MongoDB connection closed');
    });

    // Monitor performance events
    conn.on('slow', (data) => {
      logger.warn('MongoDB slow query detected:', data);
    });

    await conn;
    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      logger.info(`Retrying connection... Attempt ${retryCount} of ${MAX_RETRIES}`);
      return new Promise((resolve) => {
        setTimeout(() => resolve(connectWithRetry(options)), RETRY_INTERVAL);
      });
    }
    throw error;
  }
};

const getConnection = async () => {
  if (conn == null) {
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
      heartbeatFrequencyMS: 2000, // Check server status every 2 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      ...(process.env.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
        sslCA: Buffer.from(sslCA, 'base64'),
      }),
    };

    await connectWithRetry(options);

    // Schema registration
    conn.model('Account', accountSchema);
    conn.model('AccountTransaction', accountTransactionSchema);
    conn.model('Banner', bannerSchema);
    conn.model('Branch', branchSchema);
    conn.model('BranchStaff', branchStaffSchema);
    conn.model('Brand', brandSchema);
    conn.model('Cart', cartSchema);
    conn.model('CartItem', cartItemSchema);
    conn.model('Category', categorySchema);
    conn.model('Collection', collectionSchema);
    conn.model('Contribution', contributionSchema);
    conn.model('Customer', customerSchema);
    conn.model('DailySummary', dailySummarySchema);
    conn.model('Expenditure', expenditureSchema);
    conn.model('FileUpload', fileUploadSchema);
    conn.model('Ledger', ledgerSchema);
    conn.model('MerchantAdmin', merchantAdminSchema);
    conn.model('MerchantRequest', merchantRequestSchema);
    conn.model('Notification', notificationSchema);
    conn.model('Opt', optSchema);
    conn.model('Package', packageSchema);
    conn.model('Permission', permissionSchema);
    conn.model('Product', productSchema);
    conn.model('ProductCatalogue', productCatalogueSchema);
    conn.model('ProductCollection', productCollectionSchema);
    conn.model('ProductRequest', productRequestSchema);
    conn.model('Promotion', promotionSchema);
    conn.model('Role', roleSchema);
    conn.model('RolePermission', rolePermissionSchema);
    conn.model('Sales', saleSchema);
    conn.model('SalesItem', salesItemSchema);
    conn.model('SbPackage', sbPackageSchema);
    conn.model('Token', tokenSchema);
    conn.model('User', userSchema);
    conn.model('UserRoles', userRoleSchema);
    conn.model('NotificationPreference', notificationPreferenceSchema);
  }

  return conn;
};

// Add a health check function
const checkConnection = () => {
  if (!conn) return false;
  return conn.readyState === 1; // 1 = connected
};

module.exports = { getConnection, checkConnection };
