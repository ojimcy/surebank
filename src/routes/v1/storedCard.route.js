const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const storedCardValidation = require('../../validations/storedCard.validation');
const storedCardController = require('../../controllers/storedCard.controller');

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(storedCardValidation.storeCard), storedCardController.storeCard)
    .get(auth(), validate(storedCardValidation.getUserCards), storedCardController.getUserCards);

router
    .route('/default')
    .get(auth(), storedCardController.getDefaultCard);

router
    .route('/:cardId')
    .get(auth(), validate(storedCardValidation.getCard), storedCardController.getCard)
    .patch(auth(), validate(storedCardValidation.setDefaultCard), storedCardController.setDefaultCard)
    .delete(auth(), validate(storedCardValidation.deleteCard), storedCardController.deleteCard);

router
    .route('/:cardId/deactivate')
    .patch(auth(), validate(storedCardValidation.deactivateCard), storedCardController.deactivateCard);

router
    .route('/:cardId/validate')
    .post(auth(), validate(storedCardValidation.validateCard), storedCardController.validateCard);

module.exports = router; 