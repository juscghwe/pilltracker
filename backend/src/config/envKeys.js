/**
 * @typedef {object} AppPersistenceEnvKeys
 * @property {string} databasePath Environment variable name for the main app database path.
 * @property {string} sqliteJournalMode Environment variable name for the main app SQLite journal
 *   mode.
 */

/**
 * @typedef {object} AppEnvKeys
 * @property {Readonly<AppPersistenceEnvKeys>} persistence Main app persistence environment variable
 *   names.
 */

/**
 * @typedef {object} DevNotesStorageEnvKeys
 * @property {string} enabled Environment variable name for enabling this dev-notes storage target.
 * @property {string} databasePath Environment variable name for this dev-notes storage database
 *   path.
 * @property {string} journalMode Environment variable name for this dev-notes storage SQLite
 *   journal mode.
 */

/**
 * @typedef {object} DevNotesEnvKeys
 * @property {string} enabled Environment variable name for enabling dev-notes routes.
 * @property {Readonly<{
 *   temp: Readonly<DevNotesStorageEnvKeys>;
 *   persistent: Readonly<DevNotesStorageEnvKeys>;
 * }>} storage
 *   Dev-notes storage environment variable names.
 */

/**
 * @typedef {object} EnvKeys
 * @property {string} nodeEnv Environment variable name for the runtime environment.
 * @property {Readonly<AppEnvKeys>} app Main app environment variable names.
 * @property {Readonly<DevNotesEnvKeys>} devNotes Dev-notes environment variable names.
 */

/**
 * Environment variable names used by app configuration and adapter validation.
 *
 * Keep these names centralized so config parsing and adapter error messages cannot drift apart.
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
