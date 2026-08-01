/** Condensed dev-notes health mapping for backend-wide summary endpoints. */

/**
 * @param {Readonly<import("../resource/types.js").DevNotesHealthResult>} health Detailed health.
 * @returns {Readonly<import("../resource/types.js").DevNotesPartialHealthResult>} Summary health.
 */
export function summarizeDevNotesHealth(health) {
  return Object.freeze({
    status: health.status,
    enabled: health.enabled,
    storage: Object.freeze(
      health.storage.map((entry) =>
        Object.freeze({
          storageKind: entry.storageKind,
          status: entry.status,
          enabled: entry.enabled,
        }),
      ),
    ),
  });
}
