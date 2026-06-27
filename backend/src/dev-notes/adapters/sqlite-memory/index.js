import { readFileSync } from "node:fs";

import { appConfig, validSqliteJournalModes } from "../../../config/appConfig.js";
import { SqliteJournalModeMismatchError } from "../../../errors/index.js";
import {
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../../../sqlite/connection.js";
import { createSqliteHealthReporter } from "../../../sqlite/health.js";
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3-memory";
const moduleName = "dev-notes sqlite-memory adapter";
const databasePath = appConfig.devNotes.storage.temp.databasePath ?? ":memory:";
const requestedJournalMode = "memory";
const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

function assertJournalMode(connection) {
  const activeJournalMode = getActiveSqliteJournalMode(connection);

  if (activeJournalMode !== requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode,
      activeJournalMode,
      moduleName,
    });
  }
}

function openConnection() {
  if (!db) {
    db = openConfiguredSqliteConnection({
      databasePath,
      requestedJournalMode,
    });

    db.exec(schemaSql);

    seedDevNotes(db, {
      count: minDevNoteEntries,
      mode: "when-empty",
    });
  }

  assertJournalMode(db);

  return db;
}

function getConnection() {
  return openConnection();
}

const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: import.meta.url,
  databasePath,
  requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

export const devNotesSqliteMemoryAdapter = {
  getConnection,
  getHealth,
};
