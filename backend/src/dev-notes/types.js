/**
 * @typedef {object} DevNote
 * @property {number} id Dev-note id.
 * @property {string} text Dev-note text.
 * @property {string} createdAt ISO timestamp for creation time.
 * @property {string} updatedAt ISO timestamp for last update time.
 */

/** @typedef {"temp" | "persistent"} DevNotesStorageKind */

/**
 * @typedef {"ok"
 *   | "created"
 *   | "replaced"
 *   | "updated"
 *   | "deleted"
 *   | "not-found"
 *   | "invalid-request"
 *   | "operation-failed"
 *   | "unknown-storage"
 *   | "storage-disabled"} statusReturns
 *   Machine-readable operation status.
 */

/**
 * @typedef {object} CreateDevNoteInput
 * @property {string} text Dev-note text.
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

/**
 * @typedef {object} DevNotesStorageAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active dev-notes
 *   SQLite connection.
 * @property {() => Readonly<object>} getHealth Returns SQLite health for this storage adapter.
 * @property {() => DevNote[]} listDevNotes Lists dev-notes from this storage adapter.
 * @property {(input: CreateDevNoteInput) => DevNote | null} createDevNote Creates a dev-note in
 *   this storage adapter.
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
 * @property {statusReturns} status Machine-readable operation status.
 * @property {DevNote[]} [notes] Listed dev-notes.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesBaseResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {statusReturns} status Machine-readable operation status.
 * @property {DevNote} [note] Created dev-note.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {DevNotesBaseResult & {
 *   notes?: DevNote[];
 * }} DevNotesListResult
 */

/**
 * @typedef {DevNotesBaseResult & {
 *   note?: DevNote;
 * }} DevNotesSingleResult
 */

/** @typedef {DevNotesSingleResult} DevNotesGetResult */

/** @typedef {DevNotesSingleResult} DevNotesCreateResult */

/** @typedef {DevNotesSingleResult} DevNotesReplaceResult */

/** @typedef {DevNotesSingleResult} DevNotesUpdateResult */

/** @typedef {DevNotesSingleResult} DevNotesDeleteResult */

/**
 * @typedef {DevNotesBaseResult & {
 *   notes?: DevNote[];
 * }} DevNotesSearchResult
 */

/** @typedef {"missing" | "empty" | "wrong-type" | "invalid-value"} DevNotesValidationReason */

/**
 * @typedef {object} DevNotesValidationDetails
 * @property {string} field Invalid field name.
 * @property {DevNotesValidationReason} reason Machine-readable validation reason.
 * @property {string} [actualType] Actual JavaScript type when validation failed because of type.
 * @property {any} [actualValue] Actual value when validation failed because of value.
 */

/**
 * @typedef {object} DevNotesGetResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {statusReturns} status Machine-readable operation status.
 * @property {DevNote | null} [note] Found dev-note, or null when no note matched.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesSearchResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {statusReturns} status Machine-readable operation status.
 * @property {DevNote[]} [notes] Matching dev-notes.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNoteTextValidationSuccessResult
 * @property {true} ok Whether validation succeeded.
 * @property {string} value Normalized non-empty dev-note text.
 */

/** @typedef {DevNoteIdValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteIdValidationResult */

/** @typedef {DevNoteTextValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteTextValidationResult */

/**
 * @typedef {object} DevNotesSqliteFilePersistenceConfig
 * @property {string} databasePath SQLite database path for persistent dev-notes storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} DevNotesSqliteMemoryPersistenceConfig
 * @property {string} databasePath SQLite in-memory database path.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

export {};
