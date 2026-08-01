/** @typedef {import("../domain/httpclient.js").JsonHttpResult} JsonHttpResult */
/** @typedef {import("../domain/httpclient.js").ApiDebugResult} ApiDebugResult */

import { fetchApiDebugResult, fetchJson } from "./apiClient.js";

/** Constant health endpoint definitions. */
export const healthDebugEndpoints = Object.freeze([
  Object.freeze({
    id: "summary",
    title: "Compact health summary",
    path: "/api/health",
  }),
  Object.freeze({
    id: "runtime",
    title: "Runtime health",
    path: "/api/health/runtime",
  }),
  Object.freeze({
    id: "persistenceCompact",
    title: "Compact persistence health",
    path: "/api/health/persistence",
  }),
  Object.freeze({
    id: "persistenceDetailed",
    title: "Detailed persistence health",
    path: "/api/health/persistence?details=full",
  }),
  Object.freeze({
    id: "devNotesCompact",
    title: "Compact dev-notes health",
    path: "/api/health/dev-notes",
  }),
  Object.freeze({
    id: "devNotesDetailed",
    title: "Detailed dev-notes health",
    path: "/api/health/dev-notes?details=full",
  }),
]);

/**
 * Fetches health endpoints dynamically.
 *
 * @param endpoint
 * @returns {Promise<JsonHttpResult>} Compact backend health response.
 */
export function fetchHealthDebugEndpoint(endpoint) {
  return fetchApiDebugResult(endpoint.path);
}

/**
 * Fetches the compact backend health summary.
 *
 * @returns {Promise<JsonHttpResult>} Compact backend health response.
 */
export function fetchHealthSummary() {
  return fetchJson("/api/health");
}
