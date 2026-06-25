import { persistenceAdapter } from "../persistence/index.js";

function getPersistenceAdapter() {
  return persistenceAdapter;
}

/**
 * @param {{ includeDetails?: boolean }} options includeDetails - `full` for entire output, default reduced return
 * @return {Object} persistenceHealth
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
 * @return {Object} vitals-only condensed `persistenceHealth`
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
