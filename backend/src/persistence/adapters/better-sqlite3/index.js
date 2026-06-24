import Database from "better-sqlite3";
import { appConfig } from "../../../config/appConfig.js";

let db;

const adapterId = "better-sqlite3";
const sourceModule = import.meta.url;
const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

function getConnection() {
  if (!appConfig.databasePath) {
    throw new Error("DB_PATH environment variable is not configured");
  }

  if (!db) {
    db = new Database(appConfig.databasePath);
    db.pragma(`journal_mode = ${requestedJournalMode}`, { simple: true });
  }

  return db;
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

      return {
        status: probe.ok === 1 ? "healthy" : "unhealthy",
        engine: {
          reportedFamily: "sqlite",
          version: probe.sqliteVersion,
          source: "database_query",
        },
        adapter: {
          id: adapterId,
          sourceModule: sourceModule,
        },
        journalMode: {
          requested: requestedJournalMode,
          active: activeJournalMode,
        },
        path: {
          isConfigured: Boolean(appConfig.databasePath),
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        adapter: {
          id: adapterId,
          sourceModule,
        },
        path: {
          isConfigured: Boolean(appConfig.databasePath),
        },
        error: {
          name: error.name,
          message: error.message,
        },
      };
    }
  },
};
