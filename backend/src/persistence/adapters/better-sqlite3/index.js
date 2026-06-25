/**
 * @typedef {object} BetterSqlitePersistenceAdapter
 * @property {() => Database.Database} getConnection Returns the active SQLite connection.
 * @property {() => object} getHealth Returns SQLite persistence health.
 */

import Database from "better-sqlite3";

import { appConfig, validSqliteJournalModes } from "../../../config/appConfig.js";

let db;

const adapterId = "better-sqlite3";
const sourceModule = import.meta.url;

function getAdapterInfo() {
  return {
    id: adapterId,
    sourceModule,
  };
}

function getPathInfo() {
  return {
    isConfigured: Boolean(appConfig.database.path),
  };
}

function getRequestedJournalModeInfo() {
  const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

  return {
    requested: requestedJournalMode,
    isConfigured: Boolean(requestedJournalMode),
    isValid: requestedJournalMode ? validSqliteJournalModes.has(requestedJournalMode) : false,
  };
}

function getPersistenceConfig() {
  const databasePath = appConfig.database.path;
  const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

  if (!databasePath) {
    throw new Error("DB_PATH environment variable is not configured");
  }

  if (!requestedJournalMode) {
    throw new Error("SQLITE_JOURNAL_MODE environment variable is not configured");
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new Error(
      `Invalid SQLITE_JOURNAL_MODE: ${requestedJournalMode}. Expected one of: ${[
        ...validSqliteJournalModes,
      ].join(", ")}`,
    );
  }

  return {
    databasePath,
    requestedJournalMode,
  };
}

function openConnection(persistenceConfig) {
  if (!db) {
    db = new Database(persistenceConfig.databasePath);
    db.pragma(`journal_mode = ${persistenceConfig.requestedJournalMode}`, { simple: true });
  }

  return db;
}

function getConnection() {
  const persistenceConfig = getPersistenceConfig();

  return openConnection(persistenceConfig);
}

function createUnhealthyHealth(error) {
  return {
    status: "unhealthy",
    adapter: getAdapterInfo(),
    path: getPathInfo(),
    journalMode: getRequestedJournalModeInfo(),
    error: {
      name: error.name,
      message: error.message,
    },
  };
}

function createHealthyHealth({ probe, activeJournalMode, persistenceConfig }) {
  return {
    status: probe.ok === 1 ? "healthy" : "unhealthy",
    engine: {
      reportedFamily: "sqlite",
      version: probe.sqliteVersion,
      source: "database_query",
    },
    adapter: getAdapterInfo(),
    journalMode: {
      requested: persistenceConfig.requestedJournalMode,
      active: activeJournalMode,
    },
    path: getPathInfo(),
  };
}

/**
 * Persistence adapter backed by better-sqlite3.
 *
 * @type {BetterSqlitePersistenceAdapter}
 * @see ./README.md#better-sqlite3-adapter
 */
export const persistenceAdapter = {
  getConnection,

  getHealth() {
    try {
      const persistenceConfig = getPersistenceConfig();
      const connection = openConnection(persistenceConfig);

      const probe = connection
        .prepare(
          `
                SELECT 
                    1 AS ok,
                    sqlite_version() AS sqliteVersion
                `,
        )
        .get();

      const activeJournalMode = connection.pragma("journal_mode", { simple: true });

      return createHealthyHealth({ probe, activeJournalMode, persistenceConfig });
    } catch (error) {
      return createUnhealthyHealth(error);
    }
  },
};
