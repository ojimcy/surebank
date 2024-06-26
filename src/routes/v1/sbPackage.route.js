const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const sbPackageValidation = require('../../validations/sbPackage.validation');
const sbPackageController = require('../../controllers/sbPackage.controller');

const router = express.Router();

router
  .route('/')
  .get(auth('sbPackages'), validate(sbPackageValidation.getAllSbPackages), sbPackageController.getAllSbPackages);

router
  .route('/package')
  .post(auth('createPackage'), validate(sbPackageValidation.createSbPackage), sbPackageController.createSbPackage)
  .get(auth('userPackage'), validate(sbPackageValidation.getUserSbPackages), sbPackageController.getUserSbPackages);

router
  .route('/make-contribution')
  .post(
    auth('makeContribution'),
    validate(sbPackageValidation.makeDailyContribution),
    sbPackageController.makeDailyContribution
  );

router
  .route('/withdraw')
  .post(
    auth('sbCustomerWithdrawal'),
    validate(sbPackageValidation.makeSbCustomerWithdrawal),
    sbPackageController.makeSbCustomerWithdrawal
  );

router
  .route('/package/merge/:targetPackageId')
  .post(auth('mergePackages'), validate(sbPackageValidation.mergeSavingsPackages), sbPackageController.mergeSavingsPackages);

router
  .route('/package/:packageId')
  .get(auth('getPackage'), validate(sbPackageValidation.getPackageById), sbPackageController.getPackageById)
  .patch(
    auth('updatePackage'),
    validate(sbPackageValidation.updatePackageProduct),
    sbPackageController.updatePackageProduct
  );

module.exports = router;
