import { appConfig } from "../config/appConfig.js";
import { devNotesSqliteFileAdapter } from "./sqlite-file/index.js";
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
export const storageTargets = Object.freeze({
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
export function resolveStorageTarget(storageKind) {
  const storageKindString = String(storageKind).trim();
  const storageTarget = storageTargets[storageKindString];

  if (!storageTarget) {
    return Object.freeze({
      ok: false,
      status: "unknown-storage",
      message: `Unknown dev-notes storage target: ${storageKindString}`,
    });
  }

  if (!storageTarget.config.enabled) {
    return Object.freeze({
      ok: false,
      status: "storage-disabled",
      message: `Dev-notes storage target is disabled: ${storageKindString}`,
    });
  }

  return Object.freeze({
    ok: true,
    storageKind: storageKindString,
    storageTarget,
  });
}
