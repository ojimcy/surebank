const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { noteKeepingService } = require('../services');

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
  // Extract start and end date from the request query
  const { startDate, endDate } = req.query;

  // Extract page and limit for pagination from the request query
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Call the service function to get paginated expenditures within the date range
  const paginatedExpenditures = await noteKeepingService.getNotesByDateRange(startDate, endDate, page, limit);

  res.status(httpStatus.OK).send(paginatedExpenditures);
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
  await noteKeepingService.deleteNote(req.params.noteId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createNoteKeeping,
  getNoteById,
  updateNote,
  deleteNote,
  getNotes,
};
