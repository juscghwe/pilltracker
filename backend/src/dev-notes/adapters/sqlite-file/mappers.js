/**
 * Maps a SQLite dev-note row to the public dev-note shape.
 *
 * @param {object} row SQLite row.
 * @param {number} row.id Dev-note id.
 * @param {string} row.text Dev-note text.
 * @param {string} row.createdAt Creation timestamp.
 * @param {string} row.updatedAt Update timestamp.
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
 * @param {object[]} rows SQLite rows.
 * @returns {import("../../types.js").DevNote[]} Public dev-notes.
 */
export function rowsToDevNotes(rows) {
  return rows.map(rowToDevNote);
}
