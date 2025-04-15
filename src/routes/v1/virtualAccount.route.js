const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const virtualAccountValidation = require('../../validations/virtualAccount.validation');
const virtualAccountController = require('../../controllers/virtualAccount.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('VIRTUAL_ACCOUNT_CREATE'),
    validate(virtualAccountValidation.createVirtualAccount),
    virtualAccountController.createVirtualAccount
  )
  .get(
    auth('VIRTUAL_ACCOUNT_VIEW'),
    validate(virtualAccountValidation.getUserVirtualAccount),
    virtualAccountController.getVirtualAccount
  );

router
  .route('/user/:userId')
  .post(
    auth('VIRTUAL_ACCOUNT_MANAGE'),
    validate(virtualAccountValidation.createUserVirtualAccount),
    virtualAccountController.createUserVirtualAccount
  )
  .delete(
    auth('VIRTUAL_ACCOUNT_MANAGE'),
    validate(virtualAccountValidation.deactivateVirtualAccount),
    virtualAccountController.deactivateVirtualAccount
  );

module.exports = router;
