/**
 * Public dev-note resource shape returned by the dev-notes facade and storage adapters.
 *
 * @typedef {object} DevNote
 * @property {number} id Dev-note id.
 * @property {string} text Dev-note text.
 * @property {string} createdAt ISO timestamp for creation time.
 * @property {string} updatedAt ISO timestamp for last update time.
 */

/** @typedef {"temp" | "persistent"} DevNotesStorageKind */

/**
 * Machine-readable dev-notes facade result status.
 *
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
 */

/** @typedef {"healthy" | "unhealthy" | "disabled"} DevNotesHealthStatus */

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
 * Runtime configuration for one dev-notes storage target.
 *
 * @typedef {object} DevNotesStorageConfig
 * @property {boolean} enabled Whether this storage target is enabled.
 * @property {string | null} databasePath SQLite database path or `null` when not configured.
 * @property {string | null} journalMode Requested SQLite journal mode or `null` when not configured.
 */

/**
 * Concrete storage adapter interface used by the dev-notes facade.
 *
 * @typedef {object} DevNotesStorageAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active dev-notes
 *   SQLite connection.
 * @property {() => Readonly<object>} getHealth Returns health for this storage adapter.
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
 * Resolved storage target entry used by dev-notes composition wiring.
 *
 * @typedef {object} DevNotesStorageTarget
 * @property {Readonly<DevNotesStorageConfig>} config Storage target configuration.
 * @property {Readonly<DevNotesStorageAdapter>} adapter Storage target adapter.
 */

/**
 * Base facade result returned by dev-notes operations.
 *
 * @typedef {object} DevNotesBaseResult
 * @property {boolean} ok Whether the operation succeeded.
 * @property {DevNotesResultStatus} status Machine-readable operation status.
 * @property {string} [message] Human-readable failure message.
 */

/**
 * Facade result for operations that return at most one dev-note.
 *
 * @typedef {DevNotesBaseResult & {
 *   note?: DevNote;
 * }} DevNotesSingleResult
 */

/**
 * Facade result for operations that return a dev-note list.
 *
 * @typedef {DevNotesBaseResult & {
 *   notes?: DevNote[];
 * }} DevNotesListResult
 */

/** @typedef {DevNotesSingleResult} DevNotesGetResult */
/** @typedef {DevNotesSingleResult} DevNotesCreateResult */
/** @typedef {DevNotesSingleResult} DevNotesReplaceResult */
/** @typedef {DevNotesSingleResult} DevNotesUpdateResult */
/** @typedef {DevNotesSingleResult} DevNotesDeleteResult */
/** @typedef {DevNotesListResult} DevNotesSearchResult */

/** @typedef {"missing" | "empty" | "wrong-type" | "invalid-value"} DevNotesValidationReason */

/**
 * Structured validation failure details returned by invalid dev-notes requests.
 *
 * @typedef {object} DevNotesValidationDetails
 * @property {string} field Invalid field name.
 * @property {DevNotesValidationReason} reason Machine-readable validation reason.
 * @property {string} [actualType] Actual JavaScript type when validation failed because of type.
 * @property {any} [actualValue] Actual value when validation failed because of value.
 */

/**
 * Facade result for invalid user input.
 *
 * @typedef {DevNotesBaseResult & {
 *   ok: false;
 *   status: "invalid-request";
 *   details: DevNotesValidationDetails;
 * }} DevNotesInvalidRequestResult
 */

/**
 * Successful dev-note id validation result.
 *
 * @typedef {object} DevNoteIdValidationSuccessResult
 * @property {true} ok Whether validation succeeded.
 * @property {number} value Normalized positive integer dev-note id.
 */

/**
 * Successful dev-note text validation result.
 *
 * @typedef {object} DevNoteTextValidationSuccessResult
 * @property {true} ok Whether validation succeeded.
 * @property {string} value Normalized non-empty dev-note text.
 */

/** @typedef {DevNoteIdValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteIdValidationResult */
/** @typedef {DevNoteTextValidationSuccessResult | DevNotesInvalidRequestResult} DevNoteTextValidationResult */

/**
 * Validated SQLite file configuration for persistent dev-notes storage.
 *
 * @typedef {object} DevNotesSqliteFilePersistenceConfig
 * @property {string} databasePath SQLite database path for persistent dev-notes storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * Validated SQLite configuration for temporary dev-notes storage.
 *
 * @typedef {object} DevNotesSqliteMemoryPersistenceConfig
 * @property {string} databasePath SQLite database path for temporary dev-notes storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * Health result for one dev-notes storage target.
 *
 * @typedef {object} DevNotesStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage health status.
 * @property {boolean} enabled Whether this storage target is enabled.
 * @property {Readonly<object>} [adapter] Full adapter health when details are included.
 */

/**
 * Full dev-notes subsystem health result.
 *
 * @typedef {object} DevNotesHealthResult
 * @property {DevNotesHealthStatus} status Dev-notes subsystem health status.
 * @property {boolean} enabled Whether the dev-notes subsystem is enabled.
 * @property {ReadonlyArray<Readonly<DevNotesStorageHealth>>} storage Storage health entries.
 */

/**
 * Condensed health result for one dev-notes storage target.
 *
 * @typedef {object} DevNotesPartialStorageHealth
 * @property {DevNotesStorageKind} storageKind Storage kind.
 * @property {DevNotesHealthStatus} status Storage health status.
 * @property {boolean} enabled Whether this storage target is enabled.
 */

/**
 * Condensed dev-notes subsystem health result.
 *
 * @typedef {object} DevNotesPartialHealthResult
 * @property {DevNotesHealthStatus} status Dev-notes subsystem health status.
 * @property {boolean} enabled Whether the dev-notes subsystem is enabled.
 * @property {ReadonlyArray<Readonly<DevNotesPartialStorageHealth>>} storage Condensed storage health entries.
 */

export {};
