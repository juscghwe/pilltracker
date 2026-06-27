// Persistent dev-notes storage

import { appConfig, validSqliteJournalModes } from "../../../../config/appConfig.js";
import { createSqliteHealthReporter } from "../../../../sqlite/health.js";
import {
  applySqliteJournalMode,
  getActiveSqliteJournalMode,
  openSqliteConnection,
} from "../../../sqlite/connection";
import {
  MissingEnvironmentVariableError,
  SqliteJournalModeMismatchError,
  InvalidEnvironmentVariableError,
} from "../../../errors/AppError.js";

let db;

const adapterId = "better-sqlite3";

const getHealth = createSqliteHealthReporter({
  adapterId: adapterId,
  sourceModule: import.meta.url,
  databasePath: appConfig.devNotes.persistent.databasePath,
  requestedJournalMode: appConfig.sqlite.requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

function getPersistenceConfig() {
  const databasePath = appConfig.devNotes.persistent.databasePath;
  const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError("DEV_NOTES_DB_PATH", {
      moduleName: "dev-notes sqlite-file adapter",
    });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError("SQLITE_JOURNAL_MODE", {
      moduleName: "dev-notes sqlite-file adapter",
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      "SQLITE_JOURNAL_MODE",
      requestedJournalMode,
      validSqliteJournalModes,
      {
        moduleName: "dev-notes sqlite-file adapter",
      },
    );
  }

  return {
    databasePath,
    requestedJournalMode,
  };
}

function getConnection() {
  const persistenceConfig = getPersistenceConfig();

  if (!db) {
    db = openSqliteConnection(persistenceConfig.databasePath);
    applySqliteJournalMode(persistenceConfig.requestedJournalMode);
  }

  const currentJournalMode = getActiveSqliteJournalMode(db);

  if (currentJournalMode !== persistenceConfig.requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode: persistenceConfig.requestedJournalMode,
      activeJournalMode: currentJournalMode,
      moduleName: "dev-notes sqlite-file adapter",
    });
  }

  return db;
}

/**
 * Better-sqlite3 implementation of the Dev Notes persistence adapter contract.
 *
 * @type {BetterSqlitePersistenceAdapter}
 * @throws {Error}
 * @see Module README, section "better-sqlite3 adapter". // TODO: revisit post refactor
 * @see Persistence seam README, section "Public entrypoints". // TODO: revisit post refactor
 */
export const betterSqlitePersistenceAdapter = {
  getConnection,
  getHealth: getHealth,
};
