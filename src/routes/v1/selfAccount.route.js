const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountValidation = require('../../validations/account.validation');
const accountController = require('../../controllers/account.controller');

const router = express.Router();
router
  .route('/')
  .post(auth('selfAccount'), validate(accountValidation.createSelfAccount), accountController.createSelfAccount)
  .get(auth('selfAccount'), validate(accountValidation.getSelfAccount), accountController.getSelfAccount);

router
  .route('/all')
  .get(auth('selfAccount'), validate(accountValidation.getSelfAllAccounts), accountController.getSelfAllAccounts);

module.exports = router;
