/** @typedef {"healthy" | "unhealthy"} BackendHealthStatus */

/**
 * @typedef {object} RuntimeHealthSummaryCheck
 * @property {BackendHealthStatus} status Runtime health status.
 * @property {number} uptimeSeconds Node.js process uptime in seconds.
 */

/**
 * @typedef {object} PersistenceHealthSummaryCheck
 * @property {BackendHealthStatus} status Persistence health status.
 * @property {object} path Persistence path summary.
 * @property {boolean} path.isConfigured Whether the main persistence path is configured.
 */

/**
 * @typedef {object} DevNotesHealthSummaryCheck
 * @property {import("../dev-notes/types.js").DevNotesHealthStatus} status Dev-notes health status.
 * @property {boolean} enabled Whether the dev-notes subsystem is enabled.
 */

/**
 * @typedef {object} HealthSummaryChecks
 * @property {RuntimeHealthSummaryCheck} runtime Runtime health summary.
 * @property {PersistenceHealthSummaryCheck} persistence Persistence health summary.
 * @property {DevNotesHealthSummaryCheck} devNotes Dev-notes health summary.
 */

/**
 * @typedef {object} HealthSummary
 * @property {BackendHealthStatus} status Overall backend readiness.
 * @property {string} service Service identifier.
 * @property {string} environment Runtime environment.
 * @property {HealthSummaryChecks} checks Subsystem health checks.
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
      },
      persistence: {
        status: persistenceHealth.status,
        path: {
          isConfigured: persistenceHealth.path.isConfigured,
        },
      },
      devNotes: {
        status: devNotesHealth.status,
        enabled: devNotesHealth.enabled,
      },
    },
  };
}
