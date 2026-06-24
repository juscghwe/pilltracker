import Database from "better-sqlite3";
import { appConfig } from "../../../config/appConfig.js";

let db;

const adapterId = "better-sqlite3";
const sourceModule = import.meta.url;

const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

function isDatabasePathConfigured() {
  return Boolean(appConfig.database.path);
}

function getAdapterInfo() {
  return {
    id: adapterId,
    sourceModule,
  };
}

function getPathInfo() {
  return {
    isConfigured: isDatabasePathConfigured(),
  };
}

function getConnection() {
  if (!appConfig.database.path) {
    throw new Error("DB_PATH environment variable is not configured");
  }

  if (!db) {
    db = new Database(appConfig.database.path);
    db.pragma(`journal_mode = ${requestedJournalMode}`, { simple: true });
  }

  return db;
}

function createUnhealthyHealth(error) {
  return {
    status: "unhealthy",
    adapter: getAdapterInfo(),
    path: getPathInfo(),
    error: {
      name: error.name,
      message: error.message,
    },
  };
}

function createHealthyHealth({ probe, activeJournalMode }) {
  return {
    status: probe.ok === 1 ? "healthy" : "unhealthy",
    engine: {
      reportedFamily: "sqlite",
      version: probe.sqliteVersion,
      source: "database_query",
    },
    adapter: getAdapterInfo(),
    journalMode: {
      requested: requestedJournalMode,
      active: activeJournalMode,
    },
    path: getPathInfo(),
  };
}

export const persistenceAdapter = {
  getConnection,

  getHealth() {
    try {
      const connection = getConnection();

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

      return createHealthyHealth({ probe, activeJournalMode });
    } catch (error) {
      return createUnhealthyHealth(error);
    }
  },
};
