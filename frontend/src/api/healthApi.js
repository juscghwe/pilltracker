/**
 * JSON API response wrapper used by frontend API connector helpers.
 *
 * @typedef {object} JsonHttpResult
 * @property {boolean} ok Whether the response status is in the 200-299 range.
 * @property {number} status HTTP response status code.
 * @property {string} path Requested API path.
 * @property {unknown} body Parsed JSON response body.
 */

/**
 * Fetches an API route and returns its parsed JSON response with HTTP metadata.
 *
 * Non-2xx JSON responses are returned with `ok: false` so callers can decide how to display backend
 * error payloads. Non-JSON responses throw because they violate the frontend API connector
 * contract.
 *
 * @param {string} path API path to request.
 * @returns {Promise<JsonHttpResult>} Parsed JSON response wrapper.
 * @throws {Error} When the response is not JSON or JSON parsing fails.
 */
async function fetchJson(path) {
  const response = await fetch(path);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON from ${path}, got status ${response.status}.`);
  }

  const body = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    path,
    body,
  };
}
/**
 * Fetches the compact backend health summary.
 *
 * @returns {Promise<JsonHttpResult>} Compact backend health response.
 */
export function fetchHealthSummary() {
  return fetchJson("/api/health");
}

/**
 * Fetches runtime health details.
 *
 * @returns {Promise<JsonHttpResult>} Runtime health response.
 */
export function fetchRuntimeHealth() {
  return fetchJson("/api/health/runtime");
}

/**
 * Fetches full persistence health details.
 *
 * @returns {Promise<JsonHttpResult>} Persistence health response.
 */
export function fetchPersistenceHealth() {
  return fetchJson("/api/health/persistence?details=full");
}

/**
 * Fetches full dev-notes health details.
 *
 * @returns {Promise<JsonHttpResult>} Dev-notes health response.
 */
export function fetchDevNotesHealth() {
  return fetchJson("/api/health/dev-notes?details=full");
}
