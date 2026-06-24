import Database from "better-sqlite3";
import { appConfig } from "../../../config/appConfig.js";

const db = new Database(appConfig.databasePath);

const requestedJournalMode = appConfig.sqlite.requestedJournalMode;
db.pragma(`journal_mode = ${requestedJournalMode}`, { simple: true });

const adapterId = "better-sqlite3";
const sourceModule = import.meta.url;

export const persistenceAdapter = {
  getConnection: () => db,

  getHealth() {
    const probe = db
      .prepare(
        `
                SELECT 
                    1 AS ok,
                    sqlite_version() AS sqliteVersion
                `,
      )
      .get();

    const activeJournalMode = db.pragma("journal_mode", { simple: true });

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
  },
};
