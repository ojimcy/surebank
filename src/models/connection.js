const mongoose = require('mongoose');
const config = require('../config/config');
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
const packageSchema = require('./package.schema');
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

let conn = null;

const getConnection = async () => {
  if (conn == null) {
    const options = {
      ...config.mongoose.options,
      ...{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Buffering means mongoose will queue up operations if it gets
        // disconnected from MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        // and tell the MongoDB driver to not wait more than 5 seconds
        // before erroring out if it isn't connected
        serverSelectionTimeoutMS: 5000,
      },
    };
    conn = mongoose.createConnection(config.mongoose.url, options);

    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn;

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
  }

  return conn;
};

module.exports = { getConnection };
