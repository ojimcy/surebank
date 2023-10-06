const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const collectionValidation = require('../../validations/collections.validation');
const collectionController = require('../../controllers/collections.controller');

const router = express.Router();
router
  .route('/')
  .post(auth('manageCollection'), validate(collectionValidation.createCollection), collectionController.createCollection)
  .get(auth('manageCollection'), collectionController.getAllCollections);

router
  .route('/:collectionId')
  .get(auth('manageCollection'), collectionController.getCollectionById)
  .patch(
    auth('manageCollection'),
    validate(collectionValidation.updateCollection),
    collectionController.updateCollectionById
  )
  .delete(auth('manageCollection'), collectionController.deleteCollectionById);

module.exports = router;
