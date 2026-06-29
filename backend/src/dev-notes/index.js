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

import { appConfig } from "../config/appConfig.js";
import { devNotesSqliteFileAdapter } from "./sqlite-file.js";
import { devNotesSqliteMemoryAdapter } from "./sqlite-memory/index.js";

/**
 * Dev-notes storage kinds accepted by the dev-notes facade.
 *
 * @type {Readonly<{
 *   temp: "temp";
 *   persistent: "persistent";
 * }>}
 */
export const devNotesStorageKinds = Object.freeze({
  temp: "temp",
  persistent: "persistent",
});

/**
 * Dev-notes storage target registry.
 *
 * This is private composition wiring. Routes should use the exported facade functions instead of
 * importing concrete storage adapters directly.
 *
 * @private
 * @type {Readonly<
 *   Record<import("./types.js").DevNotesStorageKind, import("./types.js").DevNotesStorageTarget>
 * >}
 */
const storageTargets = Object.freeze({
  [devNotesStorageKinds.temp]: Object.freeze({
    config: appConfig.devNotes.storage.temp,
    adapter: devNotesSqliteMemoryAdapter,
  }),

  [devNotesStorageKinds.persistent]: Object.freeze({
    config: appConfig.devNotes.storage.persistent,
    adapter: devNotesSqliteFileAdapter,
  }),
});

/**
 * Resolves a configured dev-notes storage target.
 *
 * This function is intentionally private. Public callers should use facade operations such as
 * `listDevNotes` and `createDevNote` instead of retrieving storage adapters directly.
 *
 * @private
 * @param {string} storageKind Requested storage kind.
 * @returns {Readonly<{
 *       ok: true;
 *       storageKind: import("./types.js").DevNotesStorageKind;
 *       storageTarget: import("./types.js").DevNotesStorageTarget;
 *     }>
 *   | Readonly<{
 *       ok: false;
 *       status: "unknown-storage" | "storage-disabled";
 *       message: string;
 *     }>}
 *   Resolved storage target or failure result.
 */
function resolveStorageTarget(storageKind) {
  const storageKindString = storageKind.text.trim();

  if (!(storageKindString in devNotesStorageKinds)) {
    return Object.freeze({
      ok: false,
      storageKind: "unknown-storage",
      message: `There's no storage of name\n${storageKindString}\ndefined in the Backend.`,
    });
  }

  const standIn = storageTargets[devNotesStorageKinds[storageKindString]];

  if (!standIn.config.enabled) {
    return Object.freeze({
      ok: false,
      status: "storage-disabled",
      message: `The storage of name\n${storageKindString}\nis disabled. You need to enable it in docker-compose.yaml.`,
    });
  }

  return Object.freeze({
    ok: true,
    storageKind: storageKindString,
    storageTarget: Object.freeze(standIn),
  });
}

/**
 * Lists dev-notes from the requested storage target.
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @returns {import("./types.js").DevNotesListResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function listDevNotes(input) {
  const adapterModel = resolveStorageTarget(input.storageKind.trim());

  if (adapterModel.ok) {
    const adapter = adapterModel.storageTarget.adapter;

    return Object.freeze({
      ok: true,
      status: adapter.getHealth(),
      notes: adapter.listDevNotes(),
    });
  }

  return adapterModel;
}

/**
 * Creates a dev-note in the requested storage target.
 *
 * @param {object} input Create input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesCreateResult} Create result.
 * @see Dev-notes README, section "storage facade".
 */
export function createDevNote(input) {
  const adapterModel = resolveStorageTarget(input.storageKind.trim());

  if (adapterModel.ok) {
    const adapter = adapterModel.storageTarget.adapter;

    return Object.freeze({
      ok: true,
      status: adapter.getHealth(),
      notes: adapter.createDevNotes(input.text.trim()),
    });
  }

  return adapterModel;
}
