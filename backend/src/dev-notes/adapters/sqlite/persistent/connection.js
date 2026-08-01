/** Lazy connection lifecycle for the persistent dev-notes SQLite repository. */

import {
  appConfig,
  environmentKeys,
  validSqliteJournalModes,
} from "../../../../config/appConfig.js";
import {
  InvalidEnvironmentVariableError,
  MissingEnvironmentVariableError,
  SqliteJournalModeMismatchError,
} from "../../../../errors/index.js";
import {
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../../../../sqlite/connection.js";
import { devNotesResource } from "../../../resource/contract.js";
import { ensureSqliteSchema } from "../sqlite-schema.js";

/** @type {import("better-sqlite3").Database | null} */
let connection = null;

const moduleName = "dev-notes-new persistent SQLite connection";
const configuredStorage = appConfig.devNotes.storage.persistent;
const configuredKeys = environmentKeys.devNotes.storage.persistent;
const journalModeKey = `${configuredKeys.journalMode} or ${environmentKeys.app.persistence.sqliteJournalMode}`;

export const persistentConnectionMetadata = Object.freeze({
  adapterId: "better-sqlite3-dev-notes-persistent",
  sourceModule: import.meta.url,
  databasePath: configuredStorage.databasePath,
  requestedJournalMode: configuredStorage.journalMode,
});

/**
 * @returns {{
 *   databasePath: string;
 *   requestedJournalMode: import("../../../../config/types.js").SqliteJournalMode;
 * }}
 *   Validated config.
 */
function readConnectionConfig() {
  const databasePath = configuredStorage.databasePath;
  const requestedJournalMode = configuredStorage.journalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError(configuredKeys.databasePath, { moduleName });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError(journalModeKey, { moduleName });
  }

  const knownJournalMode = /** @type {import("../../../../config/types.js").SqliteJournalMode} */ (
    requestedJournalMode
  );

  if (!validSqliteJournalModes.has(knownJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      journalModeKey,
      knownJournalMode,
      validSqliteJournalModes,
      { moduleName },
    );
  }

  return { databasePath, requestedJournalMode: knownJournalMode };
}

/**
 * @param {import("better-sqlite3").Database} database SQLite connection.
 * @param {import("../../../../config/types.js").SqliteJournalMode} requestedJournalMode Requested
 *   mode.
 * @returns {void}
 */
function assertJournalMode(database, requestedJournalMode) {
  const activeJournalMode = getActiveSqliteJournalMode(database);

  if (activeJournalMode !== requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode,
      activeJournalMode,
      moduleName,
    });
  }
}

/** @returns {import("better-sqlite3").Database} Active connection. */
export function getPersistentConnection() {
  const config = readConnectionConfig();

  if (!connection) {
    connection = openConfiguredSqliteConnection(config);
    ensureSqliteSchema(connection, devNotesResource);
  }

  assertJournalMode(connection, config.requestedJournalMode);
  return connection;
}
