const express = require('express');
const config = require('../../config/config');
const homeRoute = require('./home.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const securityRoute = require('./security.route');
const notificationRoute = require('./notification.route');
const branchRoute = require('./branch.route');
const categoryRoute = require('./category.route');
const accountRoute = require('./account.route');
const accountingRoute = require('./accounting.route');
const accountTransactionRoute = require('./accountTransaction.route');
const aclRoute = require('./acl.route');
const customerRoute = require('./customer.route');
const dailySavingsRoute = require('./dailySavings.route');
const merchantRoute = require('./merchant.route');
const productRoute = require('./product.route');
const storeRoute = require('./store.route');
const cartRoute = require('./cart.route');
const salesRoute = require('./sales.route');
const reportsRoute = require('./reports.route');
const expenditureRoute = require('./expenditure.route');
const staffRoute = require('./staff.route');
const collectionRoute = require('./collections.route');
const fileUploadRoute = require('./fileUpload.route');
const sbPackageRoute = require('./sbPackage.route');
const chargeRoute = require('./charge.route');
const orderRoute = require('./order.route');
const smsRoute = require('./sms.route');
const noteKeepingRoute = require('./noteKeeping.route');
const kycRoute = require('./kyc.route');
const paystackRoute = require('./paystack.route');
const virtualAccountRoute = require('./virtualAccount.route');
const paymentRoute = require('./payment.route');
const selfAccountRoute = require('./selfAccount.route');
const interestPackageRoute = require('./interestPackage.route');
const s3Route = require('./s3.route');
const healthRoute = require('./health.route');
const storedCardRoute = require('./storedCard.route');
const scheduledContributionRoute = require('./scheduledContribution.route');
const systemRoute = require('./system.route');
const sesWebhookRoute = require('./sesWebhook.route');
const mailjetWebhookRoute = require('./mailjetWebhook.route');
const emailTestingRoute = require('./emailTesting.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/home',
    route: homeRoute,
  },
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
    path: '/categories',
    route: categoryRoute,
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
    path: '/merchants',
    route: merchantRoute,
  },
  {
    path: '/products',
    route: productRoute,
  },
  {
    path: '/stores',
    route: storeRoute,
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
  {
    path: '/daily-savings/sb',
    route: sbPackageRoute,
  },
  {
    path: '/charge',
    route: chargeRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/sms',
    route: smsRoute,
  },
  {
    path: '/note-keeping',
    route: noteKeepingRoute,
  },
  {
    path: '/kyc',
    route: kycRoute,
  },
  {
    path: '/paystack',
    route: paystackRoute,
  },
  {
    path: '/virtual-accounts',
    route: virtualAccountRoute,
  },
  {
    path: '/payments',
    route: paymentRoute,
  },
  {
    path: '/self-accounts',
    route: selfAccountRoute,
  },
  {
    path: '/interest-savings',
    route: interestPackageRoute,
  },
  {
    path: '/s3',
    route: s3Route,
  },
  {
    path: '/health',
    route: healthRoute,
  },
  {
    path: '/stored-cards',
    route: storedCardRoute,
  },
  {
    path: '/scheduled-contributions',
    route: scheduledContributionRoute,
  },
  {
    path: '/system',
    route: systemRoute,
  },
  {
    path: '/ses',
    route: sesWebhookRoute,
  },
  {
    path: '/mailjet',
    route: mailjetWebhookRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/email-testing',
    route: emailTestingRoute,
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
