import {
  fetchDevNotesHealth,
  fetchHealthSummary,
  fetchPersistenceHealth,
  fetchRuntimeHealth,
  fetchHealthSummaryDebug,
  fetchRuntimeHealthDebug,
  fetchPersistenceHealthDebug,
  fetchDevNotesHealthDebug,
} from "../api/healthApi.js";

/** @typedef {import("../domain/health.js").HealthDebugReport} HealthDebugReport */
/** @typedef {import("../domain/health.js").ApiDebugResult} ApiDebugResult */
/** @typedef {import("../domain/health.js").HealthDebugEndpointResult} HealthDebugEndpointResult */
/** @typedef {import("../domain/health.js").ApiHealthDebugReport} ApiHealthDebugReport */

/**
 * Converts an unknown thrown value into a readable error message.
 *
 * @param {unknown} error Thrown error value.
 * @returns {string} Readable error message.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Loads one health debug endpoint without letting failures abort the full report.
 *
 * @param {() => Promise<ApiDebugResult>} fetchEndpoint Endpoint fetch function.
 * @returns {Promise<HealthDebugEndpointResult>} Endpoint debug result.
 */
async function loadHealthEndpoint(fetchEndpoint) {
  try {
    return {
      status: "fulfilled",
      value: await fetchEndpoint(),
      error: null,
    };
  } catch (error) {
    return {
      status: "rejected",
      value: null,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Loads the health endpoint responses needed by the debug health view.
 *
 * This service intentionally returns raw JSON response wrappers because the health page is
 * currently used to validate the frontend/API pipeline before final health view models are locked
 * down.
 *
 * @returns {Promise<ApiHealthDebugReport>} Loaded health debug report.
 */
export async function loadHealthDebugReport() {
  /*const [summary, runtime, persistence, devnotes] = await Promise.all([
    fetchHealthSummary(),
    fetchRuntimeHealth(),
    fetchPersistenceHealth(),
    fetchDevNotesHealth(),
  ]);

  return {
    summary,
    runtime,
    persistence,
    devnotes,
  };*/
  const [summary, runtime, persistence, devNotes] = await Promise.all([
    loadHealthEndpoint(fetchHealthSummaryDebug),
    loadHealthEndpoint(fetchRuntimeHealthDebug),
    loadHealthEndpoint(fetchPersistenceHealthDebug),
    loadHealthEndpoint(fetchDevNotesHealthDebug),
  ]);

  return {
    summary,
    runtime,
    persistence,
    devNotes,
  };
}
