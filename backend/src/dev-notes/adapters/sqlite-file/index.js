import { getConnection, getHealth } from "./connection.js";
import {
  listDevNotes,
  getDevNoteById,
  searchDevNotesByText,
  createDevNote,
  replaceDevNote,
  updateDevNote,
  deleteDevNote,
} from "./queries.js";

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
