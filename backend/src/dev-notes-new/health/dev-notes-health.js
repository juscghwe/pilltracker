/** Feature-level dev-notes health aggregation. Health is read-only apart from normal lazy DB init. */

import { summarizeDevNotesHealth } from "./dev-notes-health-summary.js";

/**
 * @typedef {object} CreateDevNotesHealthInput
 * @property {boolean} enabled Whether the dev-notes feature is enabled.
 * @property {Readonly<Record<import("../resource/types.js").DevNotesStorageKind, import("../resource/types.js").DevNotesStorageTarget>>} storageTargets Storage registry.
 */

/**
 * @param {CreateDevNotesHealthInput} input Composition input.
 * @returns {Readonly<{
 *   getDevNotesHealth: () => Readonly<import("../resource/types.js").DevNotesHealthResult>;
 *   getDevNotesHealthPartial: () => Readonly<import("../resource/types.js").DevNotesPartialHealthResult>;
 * }>} Health service.
 */
export function createDevNotesHealth(input) {
  /**
   * @param {import("../resource/types.js").DevNotesStorageKind} storageKind Storage kind.
   * @param {import("../resource/types.js").DevNotesStorageTarget} storageTarget Target.
   * @returns {Readonly<import("../resource/types.js").DevNotesStorageHealth>} Storage health.
   */
  function getStorageHealth(storageKind, storageTarget) {
    if (!storageTarget.config.enabled) {
      return Object.freeze({ storageKind, status: "disabled", enabled: false });
    }

    const repositoryHealth = storageTarget.repository.getHealth();
    const status =
      typeof repositoryHealth === "object" &&
      repositoryHealth !== null &&
      /** @type {{status?: unknown}} */ (repositoryHealth).status === "healthy"
        ? "healthy"
        : "unhealthy";

    return Object.freeze({
      storageKind,
      status,
      enabled: true,
      repository: repositoryHealth,
    });
  }

  function getDevNotesHealth() {
    if (!input.enabled) {
      return Object.freeze({
        status: "disabled",
        enabled: false,
        storage: Object.freeze([]),
      });
    }

    const entries = /** @type {[import("../resource/types.js").DevNotesStorageKind, import("../resource/types.js").DevNotesStorageTarget][]} */ (
      Object.entries(input.storageTargets)
    );
    const storage = Object.freeze(
      entries.map(([storageKind, storageTarget]) =>
        getStorageHealth(storageKind, storageTarget),
      ),
    );
    const enabledStorage = storage.filter((entry) => entry.enabled);
    const status =
      enabledStorage.length > 0 && enabledStorage.every((entry) => entry.status === "healthy")
        ? "healthy"
        : "unhealthy";

    return Object.freeze({ status, enabled: true, storage });
  }

  function getDevNotesHealthPartial() {
    return summarizeDevNotesHealth(getDevNotesHealth());
  }

  return Object.freeze({ getDevNotesHealth, getDevNotesHealthPartial });
}
