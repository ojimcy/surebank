const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const noteKeepingValidation = require('../../validations/noteKeeping.validation');
const noteKeepingController = require('../../controllers/noteKeeping.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageNote'), validate(noteKeepingValidation.createNote), noteKeepingController.createNoteKeeping)
  .get(auth('manageNote'), validate(noteKeepingValidation.getNotes), noteKeepingController.getNotes);

router
  .route('/noteId')
  .patch(auth('manageNote'), validate(noteKeepingValidation.updateNote), noteKeepingController.updateNote)
  .patch(auth('manageNote'), validate(noteKeepingValidation.deleteNote), noteKeepingController.deleteNote)
  .get(auth('manageNote'), validate(noteKeepingValidation.getNoteById), noteKeepingController.getNoteById);

module.exports = router;
