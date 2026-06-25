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
 * @param {PersistenceHealthOptions} [options]
 * @returns {ReducedPersistenceHealth | object} Persistence health result.
 * @see ./README.md#persistence-health
 */
export function getPersistenceHealth(options = {}) {
  const fullHealth = getPersistenceAdapter().getHealth();

  if (options.includeDetails) {
    return fullHealth;
  }

  return {
    status: fullHealth.status,
    adapter: fullHealth.adapter,
    engine: fullHealth.engine,
    path: {
      isConfigured: fullHealth.path.isConfigured,
    },
  };
}

/**
 * Returns condensed persistence health for the backend-wide health summary.
 *
 * @returns {{
 *   status: "healthy" | "unhealthy",
 *   path: {
 *     isConfigured: boolean,
 *   },
 * }}
 */
export function getPersistenceHealthPartial() {
  const fullHealth = getPersistenceAdapter().getHealth();

  return {
    status: fullHealth.status,
    path: {
      isConfigured: fullHealth.path.isConfigured,
    },
  };
}
