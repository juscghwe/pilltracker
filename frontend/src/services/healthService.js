import { fetchHealthSummary, fetchRuntimeHealth } from "../api/healthApi.js";

/**
 * Loads the health endpoint responses needed by the debug health view.
 *
 * This service intentionally returns raw JSON response wrappers because the health page is
 * currently used to validate the frontend/API pipeline before final health view models are locked
 * down.
 *
 * @returns {Promise<import("../domain/health.js").HealthDebugReport>} Loaded health debug report.
 */
export async function loadHealthDebugReport() {
  const [summary, runtime] = await Promise.all([fetchHealthSummary(), fetchRuntimeHealth()]);

  return {
    summary,
    runtime,
  };
}
