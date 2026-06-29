/** @typedef {"development" | "test" | "production"} RuntimeEnvironment */

/** @typedef {"delete" | "truncate" | "persist" | "memory" | "wal" | "off"} SqliteJournalMode */

/**
 * @typedef {object} AppPersistenceSqliteConfig
 * @property {SqliteJournalMode | null} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} AppPersistenceConfig
 * @property {string | null} path Main application database path.
 * @property {Readonly<AppPersistenceSqliteConfig>} sqlite Main application SQLite configuration.
 */

/**
 * @typedef {object} AppRuntimeConfig
 * @property {Readonly<AppPersistenceConfig>} persistence Main application persistence
 *   configuration.
 */

/**
 * @typedef {object} DevNotesStorageConfig
 * @property {boolean} enabled Whether this dev-notes storage target is enabled.
 * @property {string | null} databasePath SQLite database path for this storage target.
 * @property {SqliteJournalMode | null} journalMode Requested SQLite journal mode for this storage
 *   target.
 */

/**
 * @typedef {object} DevNotesConfig
 * @property {boolean} enabled Whether dev-notes routes may be mounted.
 * @property {Readonly<{
 *   temp: Readonly<DevNotesStorageConfig>;
 *   persistent: Readonly<DevNotesStorageConfig>;
 * }>} storage
 *   Dev-notes storage target configuration.
 */

/**
 * @typedef {object} AppConfig
 * @property {RuntimeEnvironment} environment App runtime environment.
 * @property {Readonly<AppRuntimeConfig>} app Main application configuration.
 * @property {Readonly<DevNotesConfig>} devNotes Dev-notes configuration.
 */

export {};
