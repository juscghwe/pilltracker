/** @typedef {import("../domain/httpclient.js").JsonHttpResult} JsonHttpResult */
/** @typedef {import("../domain/httpclient.js").ApiDebugResult} ApiDebugResult */

import { fetchApiDebugResult, fetchJson } from "./apiClient.js";

/** Constant health endpoint definitions. */
const healthApiEndpoints = Object.freeze({
  healthSummary: "/api/health",
  runtimeHealth: "/api/health/runtime",
  persistenceHealthFull: "/api/health/persistence?details=full",
  devNotesHealthFull: "/api/health/dev-notes?details=full",
});

/**
 * Fetches the compact backend health summary.
 *
 * @returns {Promise<JsonHttpResult>} Compact backend health response.
 */
export function fetchHealthSummary() {
  return fetchJson(healthApiEndpoints.healthSummary);
}

/**
 * Fetches runtime health details.
 *
 * @returns {Promise<JsonHttpResult>} Runtime health response.
 */
export function fetchRuntimeHealth() {
  return fetchJson(healthApiEndpoints.runtimeHealth);
}

/**
 * Fetches full persistence health details.
 *
 * @returns {Promise<JsonHttpResult>} Persistence health response.
 */
export function fetchPersistenceHealth() {
  return fetchJson(healthApiEndpoints.persistenceHealthFull);
}

/**
 * Fetches full dev-notes health details.
 *
 * @returns {Promise<JsonHttpResult>} Dev-notes health response.
 */
export function fetchDevNotesHealth() {
  return fetchJson(healthApiEndpoints.devNotesHealthFull);
}

/**
 * Fetches the compact backend health summary for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Compact backend health debug response.
 */
export function fetchHealthSummaryDebug() {
  return fetchApiDebugResult(healthApiEndpoints.healthSummary);
}

/**
 * Fetches runtime health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Runtime health debug response.
 */
export function fetchRuntimeHealthDebug() {
  return fetchApiDebugResult(healthApiEndpoints.runtimeHealth);
}

/**
 * Fetches full persistence health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Persistence health debug response.
 */
export function fetchPersistenceHealthDebug() {
  return fetchApiDebugResult(healthApiEndpoints.persistenceHealthFull);
}

/**
 * Fetches full dev-notes health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Dev-notes health debug response.
 */
export function fetchDevNotesHealthDebug() {
  return fetchApiDebugResult(healthApiEndpoints.devNotesHealthFull);
}
