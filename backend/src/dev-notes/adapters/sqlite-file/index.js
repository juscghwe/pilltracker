/**
 * @typedef {object} DevNotesSqliteFilePersistenceConfig
 * @property {string} databasePath SQLite database path for persistent dev-notes storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

import { readFileSync } from "node:fs";

import { appConfig, validSqliteJournalModes, environmentKeys } from "../../../config/appConfig.js";
import {
  InvalidEnvironmentVariableError,
  MissingEnvironmentVariableError,
  SqliteJournalModeMismatchError,
} from "../../../errors/index.js";
import {
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../../../sqlite/connection.js";
import { createSqliteHealthReporter } from "../../../sqlite/health.js";
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3";
const moduleName = "dev-notes sqlite-file adapter";
const sourceModule = import.meta.url;
const configuredPersistence = appConfig.devNotes.storage.persistent;
const persistenceEnvKeys = environmentKeys.devNotes.storage.persistent;

const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Resolves and validates configuration required by the dev-notes SQLite file adapter.
 *
 * This adapter owns validation for the persistent dev-notes database path because the value is
 * optional at app-config level but required when this concrete adapter is used.
 *
 * @returns {DevNotesSqliteFilePersistenceConfig} Validated persistence configuration.
 * @throws {MissingEnvironmentVariableError} When `DEV_NOTES_DB_PATH` is missing or neither
 *   `DEV_NOTES_PERSISTENT_JOURNAL_MODE` nor `APP_SQLITE_JOURNAL_MODE` is configured.
 * @throws {InvalidEnvironmentVariableError} When `DEV_NOTES_PERSISTENT_JOURNAL_MODE` is not
 *   supported.
 * @see Module README, section "sqlite-file adapter".
 */
function getPersistenceConfig() {
  const databasePath = configuredPersistence.databasePath;
  const requestedJournalMode = configuredPersistence.journalMode;
  const journalModeEnvName = `${persistenceEnvKeys.journalMode} or ${environmentKeys.app.persistence.sqliteJournalMode}`;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError(persistenceEnvKeys.databasePath, {
      moduleName,
    });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError(journalModeEnvName, {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      journalModeEnvName,
      requestedJournalMode,
      validSqliteJournalModes,
      { moduleName },
    );
  }

  return {
    databasePath,
    requestedJournalMode,
  };
}

/**
 * Verifies that SQLite applied the requested journal mode.
 *
 * SQLite may report a different active journal mode than the requested one. This guard turns that
 * mismatch into a structured adapter error instead of silently continuing with unexpected database
 * behavior.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {DevNotesSqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
 * @returns {void}
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @see Module README, section "journal mode validation".
 */
function assertJournalMode(connection, persistenceConfig) {
  const activeJournalMode = getActiveSqliteJournalMode(connection);

  if (activeJournalMode !== persistenceConfig.requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode: persistenceConfig.requestedJournalMode,
      activeJournalMode,
      moduleName,
    });
  }
}

/**
 * Opens and validates the cached dev-notes SQLite file connection.
 *
 * The connection is opened lazily and cached by this concrete adapter. Shared SQLite helpers
 * create/configure connections, but this adapter owns the connection lifecycle for its database.
 *
 * @param {DevNotesSqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "connection lifecycle".
 */
function openConnection(persistenceConfig) {
  if (!db) {
    db = openConfiguredSqliteConnection({
      databasePath: persistenceConfig.databasePath,
      requestedJournalMode: persistenceConfig.requestedJournalMode,
    });

    db.exec(schemaSql);

    // Optional. Only use if you explicitly want demo rows.
    seedDevNotes(db, {
      count: minDevNoteEntries,
      mode: "when-empty",
    });
  }

  assertJournalMode(db, persistenceConfig);

  return db;
}

/**
 * Returns the active dev-notes SQLite file connection.
 *
 * This is the public connection entrypoint for the concrete adapter. It resolves adapter
 * configuration, opens the connection if needed, and verifies the active SQLite journal mode before
 * returning.
 *
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "public entrypoints".
 */
function getConnection() {
  const persistenceConfig = getPersistenceConfig();

  return openConnection(persistenceConfig);
}

/**
 * Health reporter for the dev-notes SQLite file adapter.
 *
 * The reporter captures adapter metadata once and calls `getConnection` when health is requested,
 * so configuration and connection failures are represented as unhealthy adapter results instead of
 * escaping the health endpoint.
 *
 * @type {() => Readonly<object>}
 * @see Module README, section "health reporting".
 */
const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: sourceModule,
  databasePath: configuredPersistence.databasePath,
  requestedJournalMode: configuredPersistence.journalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * Lists dev-notes stored in the dev-notes SQLite file database. (GET /dev-notes)
 *
 * This adapter owns the SQL mapping from its internal table layout to the public dev-note shape.
 *
 * @returns {import("../../types.js").DevNote[]} Dev-notes ordered by id.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the query.
 * @see Module README, section "dev-notes CRUD".
 */
function listDevNotes() {
  const database = getConnection();

  const rows = database
    .prepare(
      `
        SELECT
          id,
          text,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM dev_notes
        ORDER BY id ASC
    `,
    )
    .all();

  return rows.map((row) =>
    Object.freeze({
      id: row.id,
      text: row.text,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
  );
}

/**
 * Gets one dev-note by id from the dev-notes SQLite file database. (GET)
 *
 * This adapter owns the SQL mapping from its internal table layout to the public dev-note shape.
 * The lookup is intentionally id-only. Text search belongs to `searchDevNotesByText` because it can
 * return multiple rows.
 *
 * @param {import("../../types.js").GetDevNoteByIdInput} input Lookup input.
 * @returns {import("../../types.js").DevNote | null} Matching dev-note, or null when no row exists.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the query.
 * @see Module README, section "dev-notes CRUD".
 */
function getDevNoteById(input) {
  const database = getConnection();
  const id = Number(input.id);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  const row = database
    .prepare(
      `
        SELECT
          id,
          text,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM dev_notes
        WHERE id = @id
      `,
    )
    .get({
      id,
    });

  if (!row) {
    return null;
  }

  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Escapes special SQLite LIKE wildcard characters in a user-provided search fragment.
 *
 * SQLite LIKE treats `%` as any-length wildcard and `_` as single-character wildcard. Escaping them
 * keeps user input literal while still allowing this adapter to add its own surrounding `%...%`
 * contains-search pattern.
 *
 * @param {string} value Raw search fragment.
 * @returns {string} LIKE-safe search fragment.
 */
function escapeSqlLikePattern(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

/**
 * Searches dev-notes by partial text in the dev-notes SQLite file database. (GET)
 *
 * This is a filtered list operation, not a single-resource lookup. It returns every dev-note whose
 * text contains the provided search fragment, case-insensitively.
 *
 * @param {import("../../types.js").SearchDevNotesByTextInput} input Search input.
 * @returns {import("../../types.js").DevNote[] | null} Matching dev-notes ordered by id. Or null
 *   when input cannot produce valid dev-notes.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the query.
 * @see Module README, section "dev-notes CRUD".
 */
function searchDevNotesByText(input) {
  const database = getConnection();
  const text = input.text.trim();

  if (text === "") {
    return [];
  }

  const rows = database
    .prepare(
      `
        SELECT
          id,
          text,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM dev_notes
        WHERE text COLLATE NOCASE LIKE @textPattern ESCAPE char(92)
        ORDER BY id ASC
      `,
    )
    .all({
      textPattern: `%${escapeSqlLikePattern(text)}%`,
    });

  return rows.map((row) =>
    Object.freeze({
      id: row.id,
      text: row.text,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
  );
}

/**
 * Creates a dev-note in the dev-notes SQLite file database. (POST)
 *
 * This adapter owns the SQL mapping from the public create payload to its internal table layout.
 *
 * @param {import("../../types.js").CreateDevNoteInput} input Create payload.
 * @returns {import("../../types.js").DevNote | null} Created dev-note. Or null when input cannot
 *   produce a valid dev-note.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the insert.
 * @see Module README, section "dev-notes CRUD".
 */
function createDevNote(input) {
  const now = new Date().toISOString();
  const database = getConnection();
  const text = input.text.trim();

  if (text === "") {
    return null;
  }

  const insertDevNote = database.prepare(
    `
      INSERT INTO dev_notes (
          text,
          created_at,
          updated_at
        )
        VALUES (
          @text,
          @createdAt,
          @updatedAt
        )
        RETURNING
          id,
          text,
          created_at AS createdAt,
          updated_at AS updatedAt
    `,
  );

  const row = insertDevNote.get({
    text: text,
    createdAt: now,
    updatedAt: now,
  });

  if (!row) {
    return null;
  }

  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Replaces dev-note in the dev-notes SQLite file database. (PUT)
 *
 * This adapter owns the SQL mapping from the public replacement payload to its internal table
 * layout.
 *
 * @param {import("../../types.js").ReplaceDevNoteInput} input Replace payload.
 * @returns {import("../../types.js").DevNote | null} Replaced dev-note. Or null when input cannot
 *   produce a valid dev-note.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the insert.
 * @see Module README, section "dev-notes CRUD".
 */
function replaceDevNote(input) {
  const now = new Date().toISOString();
  const database = getConnection();
  const id = Number(input.id);
  const text = input.text.trim();

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  if (text === "") {
    return null;
  }

  const update = database.prepare(
    // TODO: can replace be used instead? should i add a upsert placeholder for true PUT?
    `
      UPDATE dev_notes
      SET
        text = @text,
        updated_at = @updatedAt
      WHERE id = @id
      RETURNING
        id,
        text,
        created_at AS createdAt,
        updated_at AS updatedAt
    `,
  );

  const row = update.get({
    id: id,
    text: text,
    updatedAt: now,
  });

  if (!row) {
    return null;
  }

  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Updates dev-note in the dev-notes SQLite file database. (PATCH)
 *
 * This adapter owns the SQL mapping from the public update payload to its internal table layout.
 *
 * @param {import("../../types.js").UpdateDevNoteInput} input Update payload.
 * @returns {import("../../types.js").DevNote | null} Updated dev-note. Or null when input cannot
 *   produce a valid dev-note.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the insert.
 * @see Module README, section "dev-notes CRUD".
 */
function updateDevNote(input) {
  const now = new Date().toISOString();
  const database = getConnection();
  const id = Number(input.id);
  const text = input.text.trim();

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  if (text === "") {
    return null;
  }

  const update = database.prepare(
    `
      UPDATE dev_notes
      SET
        text = @text,
        updated_at = @updatedAt
      WHERE id = @id
      RETURNING
        id,
        text,
        created_at AS createdAt,
        updated_at AS updatedAt
    `,
  );

  const row = update.get({
    id: id,
    text: text,
    updatedAt: now,
  });

  if (!row) {
    return null;
  }

  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * Deletes dev-note in the dev-notes SQLite file database. (DELETE)
 *
 * This adapter owns the SQL mapping from the public delete payload to its internal table layout.
 *
 * @param {import("../../types.js").DeleteDevNoteInput} input Delete payload.
 * @returns {import("../../types.js").DevNote | null} Deleted dev-note. Or null when input cannot
 *   return a valid dev-note.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot execute the insert.
 * @see Module README, section "dev-notes CRUD".
 */
function deleteDevNote(input) {
  const database = getConnection();
  const id = Number(input.id);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  const remove = database.prepare(
    `
      DELETE FROM dev_notes
      WHERE id = @id
      RETURNING
        id,
        text,
        created_at AS createdAt,
        updated_at AS updatedAt
    `,
  );

  const row = remove.get({
    id: id,
  });
  if (!row) {
    return null;
  }
  return Object.freeze({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * SQLite file implementation of the persistent dev-notes storage adapter.
 *
 * This adapter stores disposable dev-notes data in a separate SQLite database file. It must not be
 * used for medication-domain persistence and should be accessed through the dev-notes storage
 * facade instead of imported directly by routes.
 *
 * @type {Readonly<import("../../types.js").DevNotesStorageAdapter>}
 * @see Module README, section "sqlite-file adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteFileAdapter = {
  getConnection,
  getHealth,
  listDevNotes,
  getDevNoteById,
  searchDevNotesByText,
  createDevNote,
  replaceDevNote,
  updateDevNote,
  deleteDevNote,
};
