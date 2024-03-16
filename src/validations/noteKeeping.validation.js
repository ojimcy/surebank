const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNote = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    note: Joi.string().required(),
  }),
};

const getNotes = {
  query: Joi.object().keys({
    name: Joi.string(),
    branchId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNoteById = {
  params: Joi.object().keys({
    noteId: Joi.string().custom(objectId),
  }),
};

const updateNote = {
  params: Joi.object().keys({
    noteId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().optional(),
    note: Joi.string().optional(),
  }),
};

const deleteNote = {
  params: Joi.object().keys({
    noteId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
