/**
 * @typedef {object} AppPersistenceEnvKeys
 * @property {string} databasePath Main app DB path env var.
 * @property {string} sqliteJournalMode Main app SQLite journal-mode env var.
 */

/**
 * @typedef {object} AppEnvKeys
 * @property {Readonly<AppPersistenceEnvKeys>} persistence Main app persistence env vars.
 */

/**
 * @typedef {object} DevNotesStorageEnvKeys
 * @property {string} enabled Storage enable env var.
 * @property {string} databasePath Storage DB path env var.
 * @property {string} journalMode Storage journal-mode env var.
 */

/**
 * @typedef {object} DevNotesEnvKeys
 * @property {string} enabled Dev-notes enable env var.
 * @property {Readonly<{
 *   temp: Readonly<DevNotesStorageEnvKeys>;
 *   persistent: Readonly<DevNotesStorageEnvKeys>;
 * }>} storage
 *   Dev-notes storage env vars.
 */

/**
 * @typedef {object} EnvKeys
 * @property {string} nodeEnv Runtime env var.
 * @property {Readonly<AppEnvKeys>} app Main app env vars.
 * @property {Readonly<DevNotesEnvKeys>} devNotes Dev-notes env vars.
 */

/**
 * Central environment variable names used by config parsing and adapter validation.
 *
 * @type {Readonly<EnvKeys>}
 */
export const envKeys = Object.freeze({
  nodeEnv: "NODE_ENV",

  app: Object.freeze({
    persistence: Object.freeze({
      databasePath: "APP_DB_PATH",
      sqliteJournalMode: "APP_SQLITE_JOURNAL_MODE",
    }),
  }),

  devNotes: Object.freeze({
    enabled: "DEV_NOTES_ENABLE",

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: "DEV_NOTES_ENABLE_IN_MEMORY",
        databasePath: "DEV_NOTES_IN_MEMORY_PATH",
        journalMode: "DEV_NOTES_IN_MEMORY_JOURNAL_MODE",
      }),

      persistent: Object.freeze({
        enabled: "DEV_NOTES_ENABLE_PERSISTENT",
        databasePath: "DEV_NOTES_DB_PATH",
        journalMode: "DEV_NOTES_PERSISTENT_JOURNAL_MODE",
      }),
    }),
  }),
});
