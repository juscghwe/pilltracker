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
 * @typedef {object} DevNotesStorageAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active dev-notes
 *   SQLite connection.
 * @property {() => Readonly<object>} getHealth Returns SQLite health for this storage adapter.
 * @property {() => DevNote[]} listDevNotes Lists dev-notes from this storage adapter.
 * @property {(input: CreateDevNoteInput) => DevNote} createDevNote Creates a dev-note in this
 *   storage adapter.
 * @property {(input: GetDevNoteByIdInput) => DevNote | null} getDevNoteById Gets one dev-note by
 *   id.
 * @property {(input: SearchDevNotesByTextInput) => DevNote[]} searchDevNotesByText Searches
 *   dev-notes by text fragment.
 * @property {(input: ReplaceDevNoteInput) => DevNote | null} replaceDevNote Replaces one dev-note.
 * @property {(input: UpdateDevNoteInput) => DevNote | null} updateDevNote Updates one dev-note.
 * @property {(input: DeleteDevNoteInput) => DevNote | null} deleteDevNote Deletes one dev-note.
 */

/**
 * @typedef {object} DevNotesStorageTarget
 * @property {Readonly<object>} config Storage target configuration.
 * @property {Readonly<DevNotesStorageAdapter>} adapter Storage target adapter.
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

/**
 * @typedef {object} GetDevNoteByIdInput
 * @property {number | string} id Dev-note id.
 */

/**
 * @typedef {object} SearchDevNotesByTextInput
 * @property {string} text Text fragment to search for.
 */

/**
 * @typedef {object} DevNotesGetResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {string} status Machine-readable operation status.
 * @property {DevNote | null} [note] Found dev-note, or null when no note matched.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesSearchResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {string} status Machine-readable operation status.
 * @property {DevNote[]} [notes] Matching dev-notes.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} ReplaceDevNoteInput
 * @property {number | string} id Dev-note id.
 * @property {string} text Replacement dev-note text.
 */

/**
 * @typedef {object} UpdateDevNoteInput
 * @property {number | string} id Dev-note id.
 * @property {string} text Updated dev-note text.
 */

/**
 * @typedef {object} DeleteDevNoteInput
 * @property {number | string} id Dev-note id.
 */

export {};
