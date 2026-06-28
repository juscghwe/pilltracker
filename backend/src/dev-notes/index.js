/**
 * Description:
 *
 * - Read dev-notes config from appConfig
 * - Know which storage targets are enabled
 * - Map requested storage kind to concrete adapter
 * - Expose high-level dev-notes operations
 * - Return meaningful unavailable/unknown-storage results
 *
 * Exports:
 *
 * - ListDevNotes(storageKind)
 * - GetDevNote(storageKind, id)
 * - CreateDevNote(storageKind, payload)
 * - ReplaceDevNote(storageKind, id, payload)
 * - UpdateDevNote(storageKind, id, payload)
 * - DeleteDevNote(storageKind, id)
 * - GetDevNotesHealth()
 */

import { devNotesSqliteFileAdapter } from "./sqlite-file.js";
import { devNotesSqliteMemoryAdapter } from "./sqlite-memory/index.js";

export const devNotesPersistenceAdapter = devNotesSqliteFileAdapter;
export const devNotesTempAdapter = devNotesSqliteMemoryAdapter;
