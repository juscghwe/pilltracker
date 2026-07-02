import { appConfig } from "../config/appConfig.js";
import { storageTargets } from "./connection.js";

/**
 * Builds health for one configured dev-notes storage target.
 *
 * @param {import("./types.js").DevNotesStorageKind} storageKind Storage kind.
 * @param {import("./types.js").DevNotesStorageTarget} storageTarget Storage target.
 * @returns {Readonly<import("./types.js").DevNotesStorageHealth>} Storage health result.
 */
function getStorageTargetHealth(storageKind, storageTarget) {
  if (!storageTarget.config.enabled) {
    return Object.freeze({
      storageKind,
      status: "disabled",
      enabled: false,
    });
  }

  const adapterHealth = storageTarget.adapter.getHealth();

  return Object.freeze({
    storageKind,
    status: adapterHealth.status,
    enabled: true,
    adapter: adapterHealth,
  });
}

/**
 * Reduces storage health entries to one dev-notes subsystem status.
 *
 * @param {Readonly<import("./types.js").DevNotesStorageHealth[]>} storageHealth Storage health
 *   entries.
 * @returns {"healthy" | "unhealthy" | "disabled"} Dev-notes subsystem status.
 */
function resolveDevNotesHealthStatus(storageHealth) {
  if (!appConfig.devNotes.enabled) {
    return "disabled";
  }

  const enabledStorage = storageHealth.filter((entry) => entry.enabled);

  if (enabledStorage.length === 0) {
    return "unhealthy";
  }

  const hasHealthyStorage = enabledStorage.some((entry) => entry.status === "healthy");

  if (hasHealthyStorage) {
    return "healthy";
  }

  return "unhealthy";
}

/**
 * Returns full dev-notes subsystem health.
 *
 * @returns {Readonly<import("./types.js").DevNotesHealthResult>} Dev-notes health result.
 */
export function getDevNotesHealth() {
  const storage = Object.entries(storageTargets).map(([storageKind, storageTarget]) =>
    getStorageTargetHealth(storageKind, storageTarget),
  );

  const status = resolveDevNotesHealthStatus(storage);

  return Object.freeze({
    status,
    enabled: appConfig.devNotes.enabled,
    storage,
  });
}

/**
 * Returns condensed dev-notes health for backend-wide summary output.
 *
 * @returns {Readonly<import("./types.js").DevNotesPartialHealthResult>} Partial dev-notes health
 *   result.
 */
export function getDevNotesHealthPartial() {
  const health = getDevNotesHealth();

  return Object.freeze({
    status: health.status,
    enabled: health.enabled,
    storage: health.storage.map((entry) =>
      Object.freeze({
        storageKind: entry.storageKind,
        status: entry.status,
        enabled: entry.enabled,
      }),
    ),
  });
}
