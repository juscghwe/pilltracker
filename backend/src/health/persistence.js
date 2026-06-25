/**
 * @typedef {object} PersistenceHealthOptions
 * @property {boolean} [includeDetails] Return the full adapter health result when true.
 */

import { persistenceAdapter } from "../persistence/index.js";

function getPersistenceAdapter() {
  return persistenceAdapter;
}

/**
 * Returns persistence health for API responses.
 *
 * @param {PersistenceHealthOptions} [options]
 * @returns {object} Persistence health result.
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
