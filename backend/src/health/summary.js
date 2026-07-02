/**
 * @typedef {object} HealthSummary
 * @property {"healthy" | "unhealthy"} status Overall backend readiness.
 * @property {string} service Service identifier.
 * @property {string} environment Runtime environment.
 * @property {{
 *   runtime: {
 *     status: "healthy" | "unhealthy";
 *     uptimeSeconds: number;
 *   };
 *   persistence: {
 *     status: "healthy" | "unhealthy";
 *     path: {
 *       isConfigured: boolean;
 *     };
 *   };
 * }} checks
 *   Subsystem health checks.
 */

import { appConfig } from "../config/appConfig.js";
import { getRuntimeHealth } from "./runtime.js";
import { getPersistenceHealthPartial } from "./persistence.js";
import { getBackendDevNotesHealthPartial } from "./dev-notes.js";

/**
 * Builds the backend-wide health summary.
 *
 * @returns {HealthSummary}
 * @see Module README, section "health-summary"
 */
export function getHealthSummary() {
  const runtimeHealth = getRuntimeHealth();
  const persistenceHealth = getPersistenceHealthPartial();
  const devNotesHealth = getBackendDevNotesHealthPartial();

  const overallHealth =
    runtimeHealth.status === "healthy" &&
    persistenceHealth.status === "healthy" &&
    devNotesHealth.status !== "unhealthy"
      ? "healthy"
      : "unhealthy";

  return {
    status: overallHealth,
    service: "pilltracker-api", // TODO: query dynamically and add the URI
    environment: appConfig.environment,
    checks: {
      runtime: {
        status: runtimeHealth.status,
        uptimeSeconds: runtimeHealth.uptimeSeconds,
        devNotes: {
          status: devNotesHealth.status,
          enabled: devNotesHealth.enabled,
        },
      },
      persistence: {
        status: persistenceHealth.status,
        path: {
          isConfigured: persistenceHealth.path.isConfigured,
        },
      },
    },
  };
}
