import { getConnection } from "./connection.js";
import { escapeSqlLikePattern } from "./like.js";
import { rowToDevNote, rowsToDevNotes } from "./mappers.js";

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
export function listDevNotes() {
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

  return rowsToDevNotes(rows);
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
export function getDevNoteById(input) {
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

  return rowToDevNote(row);
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
export function searchDevNotesByText(input) {
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

  return rowsToDevNotes(rows);
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
export function createDevNote(input) {
  const now = new Date().toISOString();
  const database = getConnection();
  const text = input.text.trim();

  if (text === "") {
    return null;
  }

  const row = database
    .prepare(
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
    )
    .get({
      text: text,
      createdAt: now,
      updatedAt: now,
    });

  if (!row) {
    return null;
  }

  return rowToDevNote(row);
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
export function replaceDevNote(input) {
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

  const row = database
    .prepare(
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
    )
    .get({
      id: id,
      text: text,
      updatedAt: now,
    });

  if (!row) {
    return null;
  }

  return rowToDevNote(row);
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
export function updateDevNote(input) {
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

  const row = database
    .prepare(
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
    )
    .get({
      id: id,
      text: text,
      updatedAt: now,
    });

  if (!row) {
    return null;
  }

  return rowToDevNote(row);
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
export function deleteDevNote(input) {
  const database = getConnection();
  const id = Number(input.id);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  const row = database
    .prepare(
      `
      DELETE FROM dev_notes
      WHERE id = @id
      RETURNING
        id,
        text,
        created_at AS createdAt,
        updated_at AS updatedAt
    `,
    )
    .get({
      id: id,
    });

  if (!row) {
    return null;
  }
  return rowToDevNote(row);
}
