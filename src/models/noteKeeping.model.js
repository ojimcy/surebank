const { getConnection } = require('./connection');
const noteKeepingSchema = require('./noteKeeping.schema');

let model = null;

/**
 * @returns NoteKeeping
 */
const NoteKeeping = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('NoteKeeping', noteKeepingSchema);
  }

  return model;
};

module.exports = NoteKeeping;
