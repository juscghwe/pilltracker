/**
 * SQLite row shape selected by dev-notes adapter queries.
 *
 * @typedef {object} DevNoteRow
 * @property {number} id Dev-note id.
 * @property {string} text Dev-note text.
 * @property {string} createdAt ISO creation timestamp.
 * @property {string} updatedAt ISO update timestamp.
 */

/**
 * Maps one SQLite dev-note row to the public dev-note shape.
 *
 * @param {DevNoteRow} row SQLite row.
 * @returns {import("../../types.js").DevNote} Public dev-note.
 */
export function rowToDevNote(row) {
  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Maps SQLite dev-note rows to public dev-note shapes.
 *
 * @param {ReadonlyArray<DevNoteRow>} rows SQLite rows.
 * @returns {import("../../types.js").DevNote[]} Public dev-notes.
 */
export function rowsToDevNotes(rows) {
  return rows.map(rowToDevNote);
}
