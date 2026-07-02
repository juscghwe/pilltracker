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
 *   | "storage-disabled"} DevNotesResultStatus
 *   Machine-readable dev-notes facade result status.
 */

/**
 * @typedef {object} DevNotesBaseResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {DevNotesResultStatus} status Machine-readable operation status.
 * @property {string} [message] Human-readable failure message.
 */

/** @typedef {DevNotesSingleResult} DevNotesGetResult */
/** @typedef {DevNotesSingleResult} DevNotesCreateResult */
/** @typedef {DevNotesSingleResult} DevNotesReplaceResult */
/** @typedef {DevNotesSingleResult} DevNotesUpdateResult */
/** @typedef {DevNotesSingleResult} DevNotesDeleteResult */
/** @typedef {DevNotesListResult} DevNotesSearchResult */

/** @typedef {"missing" | "empty" | "wrong-type" | "invalid-value"} DevNotesValidationReason */

/**
 * @typedef {object} DevNotesValidationDetails
 * @property {string} field Invalid field name.
 * @property {DevNotesValidationReason} reason Machine-readable validation reason.
 * @property {string} [actualType] Actual JavaScript type when validation failed because of type.
 * @property {any} [actualValue] Actual value when validation failed because of value.
 */

/**
 * @typedef {DevNotesBaseResult & {
 *   status: "invalid-request";
 *   details: DevNotesValidationDetails;
 * }} DevNotesInvalidRequestResult
 */

/**
 * @typedef {object} DevNoteIdValidationSuccessResult
 * @property {true} ok Whether validation succeeded.
 * @property {number} value Normalized positive integer dev-note id.
 */

/**
 * @typedef {object} DevNoteTextValidationSuccessResult
 * @property {true} ok Whether validation succeeded.
 * @property {string} value Normalized non-empty dev-note text.
 */

/** @typedef {DevNoteIdValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteIdValidationResult */
/** @typedef {DevNoteTextValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteTextValidationResult */

/**
 * @typedef {DevNotesBaseResult & {
 *   note?: DevNote;
 * }} DevNotesSingleResult
 */

/**
 * @typedef {DevNotesBaseResult & {
 *   notes?: DevNote[];
 * }} DevNotesListResult
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
 * @property {DevNotesResultStatus} status Machine-readable operation status.
 * @property {DevNote[]} [notes] Listed dev-notes.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesBaseResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {DevNotesResultStatus} status Machine-readable operation status.
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
 * @property {DevNotesResultStatus} status Machine-readable operation status.
 * @property {DevNote | null} [note] Found dev-note, or null when no note matched.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * @typedef {object} DevNotesSearchResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {DevNotesResultStatus} status Machine-readable operation status.
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

/** @typedef {"healthy" | "unhealthy" | "disabled"} DevNotesHealthStatus */

/**
 * @typedef {object} DevNotesStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage health status.
 * @property {boolean} enabled Whether this storage target is enabled.
 * @property {Readonly<object>} [adapter] Full adapter health when details are included.
 */

/**
 * @typedef {object} DevNotesHealthResult
 * @property {DevNotesHealthStatus} status Dev-notes subsystem health status.
 * @property {boolean} enabled Whether the dev-notes subsystem is enabled.
 * @property {Readonly<DevNotesStorageHealth[]>} storage Storage health entries.
 */

/**
 * @typedef {object} DevNotesPartialStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage health status.
 * @property {boolean} enabled Whether this storage target is enabled.
 */

/**
 * @typedef {object} DevNotesPartialHealthResult
 * @property {DevNotesHealthStatus} status Dev-notes subsystem health status.
 * @property {boolean} enabled Whether the dev-notes subsystem is enabled.
 * @property {Readonly<DevNotesPartialStorageHealth[]>} storage Condensed storage health entries.
 */

export {};
