const express = require('express');
const config = require('../../config/config');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const securityRoute = require('./security.route');
const notificationRoute = require('./notification.route');
const branchRoute = require('./branch.route');
const accountRoute = require('./account.route');
const accountingRoute = require('./accounting.route');
const accountTransactionRoute = require('./accountTransaction.route');
const aclRoute = require('./acl.route');
const customerRoute = require('./customer.route');
const dailySavingsRoute = require('./dailySavings.route');
const merchantRoute = require('./merchant.route');
const productRoute = require('./product.route');
const storeRoute = require('./store.route');
const brandRoute = require('./brand.route');
const cartRoute = require('./cart.route');
const salesRoute = require('./sales.route');
const reportsRoute = require('./reports.route');
const expenditureRoute = require('./expenditure.route');
const staffRoute = require('./staff.route');
const collectionRoute = require('./collections.route');
const fileUploadRoute = require('./fileUpload.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/security',
    route: securityRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/branch',
    route: branchRoute,
  },
  {
    path: '/accounts',
    route: accountRoute,
  },
  {
    path: '/accounting',
    route: accountingRoute,
  },
  {
    path: '/transactions',
    route: accountTransactionRoute,
  },
  {
    path: '/roles',
    route: aclRoute,
  },
  {
    path: '/customer',
    route: customerRoute,
  },
  {
    path: '/daily-savings',
    route: dailySavingsRoute,
  },
  {
    path: '/merchant',
    route: merchantRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/store',
    route: storeRoute,
  },
  {
    path: '/brands',
    route: brandRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/sales',
    route: salesRoute,
  },
  {
    path: '/reports',
    route: reportsRoute,
  },
  {
    path: '/expenditure',
    route: expenditureRoute,
  },
  {
    path: '/staff',
    route: staffRoute,
  },
  {
    path: '/collections',
    route: collectionRoute,
  },
  {
    path: '/upload',
    route: fileUploadRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
