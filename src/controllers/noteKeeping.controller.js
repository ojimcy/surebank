const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { noteKeepingService } = require('../services');
const pick = require('../utils/pick');

const createNoteKeeping = catchAsync(async (req, res) => {
  const { amount, note } = req.body;
  const date = new Date().getTime();
  const createdBy = req.user._id;

  // Create the expenditure using the expenditure service
  const createNote = await noteKeepingService.createNote({
    date,
    amount,
    note,
    createdBy,
  });

  res.status(httpStatus.CREATED).send(createNote);
});

const getNotes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'branchId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await noteKeepingService.queryNotes(filter, options);
  res.send(result);
});

const getNoteById = catchAsync(async (req, res) => {
  const { noteId } = req.params;

  // Call the service function to get the single note by its ID
  const note = await noteKeepingService.getNoteById(noteId);

  if (!note) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Note not found' });
  }

  res.status(httpStatus.OK).send(note);
});

const updateNote = catchAsync(async (req, res) => {
  const note = await noteKeepingService.updateNote(req.params.noteId, req.body);
  res.status(httpStatus.NO_CONTENT).send(note);
});

const deleteNote = catchAsync(async (req, res) => {
  await noteKeepingService.deleteNote(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createNoteKeeping,
  getNoteById,
  updateNote,
  deleteNote,
  getNotes,
};
