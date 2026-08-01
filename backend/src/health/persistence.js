/**
 * @typedef {object} PersistenceHealthOptions
 * @property {boolean} [includeDetails] Return the full adapter health result when true.
 */

/**
 * @typedef {object} ReducedPersistenceHealth
 * @property {"healthy" | "unhealthy"} status Persistence readiness status.
 * @property {object} adapter Persistence adapter identity.
 * @property {object | undefined} engine Database engine metadata when available.
 * @property {{ isConfigured: boolean }} path Database path config state.
 */

import { persistenceAdapter } from "../persistence/index.js";

function getPersistenceAdapter() {
  return persistenceAdapter;
}

/**
 * Returns persistence health for API responses.
 *
 * Compact responses use the adapter's lightweight reporter directly. Detailed responses retain the
 * complete diagnostic reporter.
 *
 * @param {PersistenceHealthOptions} [options]
 * @returns {ReducedPersistenceHealth | Readonly<import("../sqlite/health.js").SqliteHealthResult>}
 *   Persistence health result.
 * @see Module README, section "persistence-health"
 */
export function getPersistenceHealth(options = {}) {
  if (options.includeDetails) {
    return getPersistenceAdapter().getHealth();
  }

  return getPersistenceAdapter().getHealthPartial();
}

/**
 * Returns condensed persistence health for the backend-wide health summary.
 *
 * @returns {{
 *   status: "healthy" | "unhealthy";
 *   path: {
 *     isConfigured: boolean;
 *   };
 * }}
 */
export function getPersistenceHealthPartial() {
  const health = getPersistenceAdapter().getHealthPartial();

  return Object.freeze({
    status: health.status,
    path: health.path,
  });
}
