const httpStatus = require('http-status');
const { BranchStaff, User, NoteKeeping } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new note
 * @param {Object} noteKeepingInput - NoteKeeping input data
 * @returns {Promise<Object>} The created note object
 */
const createNote = async (noteKeepingInput) => {
  const NoteKeepingModel = await NoteKeeping();
  const BranchStaffModel = await BranchStaff();
  const UserModel = await User();

  const user = await UserModel.findById(noteKeepingInput.createdBy);

  // Check if the user is not a superAdmin or admin
  if (!(user.role === 'superAdmin' || user.role === 'admin')) {
    const branch = await BranchStaffModel.findOne({ staffId: noteKeepingInput.createdBy });

    // Check if the branch is not found
    if (!branch) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Branch not found for the given admin');
    }

    const { branchId } = branch;
    const createdNote = await NoteKeepingModel.create({ ...noteKeepingInput, branchId });
    return createdNote;
  }

  // If user is superAdmin or admin, create the note without branch
  const createdNote = await NoteKeepingModel.create(noteKeepingInput);
  return createdNote;
};

/**
 * Query for notes
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNotes = async (filter, options) => {
  const NoteKeepingModel = await NoteKeeping();
  const notes = await NoteKeepingModel.paginate(filter, options);
  return notes;
};

/**
 * Get a single note by its ID
 * @param {string} noteId - ID of the note
 * @returns {Promise<Object>} The found note object
 */
const getNoteById = async (noteId) => {
  const NoteKeepingModel = await NoteKeeping();
  const note = await NoteKeepingModel.findById(noteId).populate('createdBy', 'firstName lastName');
  return note;
};

/**
 * Update note
 * @param {ObjectId} noteId
 * @param {Object} updateBody
 * @returns {Promise<Note>}
 */
const updateNote = async (noteId, updateBody) => {
  const note = await getNoteById(noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }
  Object.assign(note, updateBody);
  await note.save();
  return note;
};

/**
 * Delete note by id
 * @param {ObjectId} noteId
 * @returns {Promise<NoteKeeping>}
 */
const deleteNote = async (noteId) => {
  const note = await getNoteById(noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }
  await note.remove();
  return note;
};

module.exports = {
  createNote,
  queryNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
