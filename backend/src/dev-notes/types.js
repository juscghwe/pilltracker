/**
 * @typedef {object} DevNote
 * @property {number} id Dev-note id.
 * @property {string} text Dev-note text.
 * @property {string} createdAt ISO timestamp for creation time.
 * @property {string} updatedAt ISO timestamp for last update time.
 */

/**
 * @typedef {object} CreateDevNoteInput
 * @property {string} text Dev-note text.
 */

/** @typedef {"temp" | "persistent"} DevNotesStorageKind */

/**
 * @typedef {object} DevNotesStorageTarget
 * @property {Readonly<object>} config Storage target configuration.
 * @property {Readonly<object>} adapter Storage target adapter.
 */

/**
 * @typedef {object} DevNotesListResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {string} status Machine-readable operation status.
 * @property {DevNote[]} [notes] Listed dev-notes.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesCreateResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {string} status Machine-readable operation status.
 * @property {DevNote} [note] Created dev-note.
 * @property {string} [message] Human-readable failure message.
 */

export {};
