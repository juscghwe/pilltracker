/** Feature-level dev-notes health aggregation. Health is read-only apart from normal lazy DB init. */

/**
 * @typedef {object} CreateDevNotesHealthInput
 * @property {boolean} enabled Whether the dev-notes feature is enabled.
 * @property {Readonly<Record<string, import("../resource/types.js").DevNotesStorageTarget>>}
 *   storageTargets Storage registry.
 */

/**
 * @param {CreateDevNotesHealthInput} input Composition input.
 * @returns {Readonly<{
 *   getDevNotesHealth: () => Readonly<import("../resource/types.js").DevNotesHealthResult>;
 *   getDevNotesHealthPartial: () => Readonly<
 *     import("../resource/types.js").DevNotesPartialHealthResult
 *   >;
 * }>}
 */
export function createDevNotesHealth(input) {
  function readEntries() {
    return /** @type {[string, import("../resource/types.js").DevNotesStorageTarget][]} */ (
      Object.entries(input.storageTargets)
    );
  }

  function resolveOverallStatus(storage) {
    const enabledStorage = storage.filter((entry) => entry.enabled);
    return enabledStorage.length > 0 && enabledStorage.every((entry) => entry.status === "healthy")
      ? "healthy"
      : "unhealthy";
  }

  function getDevNotesHealth() {
    if (!input.enabled) {
      return Object.freeze({ status: "disabled", enabled: false, storage: Object.freeze([]) });
    }

    const storage = Object.freeze(
      readEntries().map(([storageKind, storageTarget]) => {
        if (!storageTarget.config.enabled) {
          return Object.freeze({ storageKind, status: "disabled", enabled: false });
        }

        const repositoryHealth = storageTarget.repository.getHealth();
        const status =
          typeof repositoryHealth === "object" &&
          repositoryHealth !== null &&
          /** @type {{ status?: unknown }} */ (repositoryHealth).status === "healthy"
            ? "healthy"
            : "unhealthy";

        return Object.freeze({
          storageKind,
          status,
          enabled: true,
          repository: repositoryHealth,
        });
      }),
    );

    return Object.freeze({ status: resolveOverallStatus(storage), enabled: true, storage });
  }

  function getDevNotesHealthPartial() {
    if (!input.enabled) {
      return Object.freeze({ status: "disabled", enabled: false, storage: Object.freeze([]) });
    }

    const storage = Object.freeze(
      readEntries().map(([storageKind, storageTarget]) => {
        if (!storageTarget.config.enabled) {
          return Object.freeze({ storageKind, status: "disabled", enabled: false });
        }

        const repository = /** @type {{ getHealthPartial?: () => Readonly<{ status: unknown }> }} */ (
          storageTarget.repository
        );
        const partialHealth = repository.getHealthPartial?.();
        const status = partialHealth?.status === "healthy" ? "healthy" : "unhealthy";

        return Object.freeze({ storageKind, status, enabled: true });
      }),
    );

    return Object.freeze({ status: resolveOverallStatus(storage), enabled: true, storage });
  }

  return Object.freeze({ getDevNotesHealth, getDevNotesHealthPartial });
}
