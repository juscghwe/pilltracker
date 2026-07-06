/** @typedef {import("../domain/health.js").JsonHttpResult} JsonHttpResult */
/** @typedef {import("../domain/health.js").ApiDebugResult} ApiDebugResult */

/** Constant endpoint definition */
const apiEndpoints = Object.freeze({
  healthSummary: "/api/health",
  runtimeHealth: "/api/health/runtime",
  persistenceHealthFull: "/api/health/persistence?details=full",
  devNotesHealthFull: "/api/health/dev-notes?details=full",
});

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
 * Checks whether a response content type should be treated as JSON.
 *
 * @param {string} contentType Response content type header value.
 * @returns {boolean} True when the response advertises a JSON body.
 */
function isJsonContentType(contentType) {
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Fetches an API route and returns its parsed JSON response with HTTP metadata.
 *
 * Non-2xx JSON responses are returned with `ok: false` so callers can decide how to display backend
 * error payloads. Non-JSON responses throw because they violate the normal frontend API connector
 * contract.
 *
 * @param {string} path API path to request.
 * @returns {Promise<JsonHttpResult>} Parsed JSON response wrapper.
 * @throws {Error} When the response is not JSON or JSON parsing fails.
 */
async function fetchJson(path) {
  const response = await fetch(path);
  const contentType = response.headers.get("content-type") ?? "";

  if (!isJsonContentType(contentType)) {
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
 * Fetches an API route for diagnostic display without hiding non-JSON responses.
 *
 * JSON responses are parsed when possible. Non-JSON responses are returned as raw text so debug
 * views can display HTML error pages, proxy fallbacks, or unexpected server output as escaped
 * text.
 *
 * This helper only throws for request-level failures such as network errors. HTTP error responses
 * are returned as diagnostic data.
 *
 * @param {string} path API path to request.
 * @returns {Promise<ApiDebugResult>} Raw diagnostic API response wrapper.
 */
async function fetchApiDebugResult(path) {
  const response = await fetch(path);
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  if (!isJsonContentType(contentType)) {
    return {
      ok: response.ok,
      status: response.status,
      path,
      contentType,
      bodyKind: "text",
      body: rawBody,
      rawBody,
      parseError: null,
    };
  }

  try {
    return {
      ok: response.ok,
      status: response.status,
      path,
      contentType,
      bodyKind: "json",
      body: rawBody === "" ? null : JSON.parse(rawBody),
      rawBody,
      parseError: null,
    };
  } catch (error) {
    return {
      ok: response.ok,
      status: response.status,
      path,
      contentType,
      bodyKind: "text",
      body: rawBody,
      rawBody,
      parseError: getErrorMessage(error),
    };
  }
}

/**
 * Fetches the compact backend health summary.
 *
 * @returns {Promise<JsonHttpResult>} Compact backend health response.
 */
export function fetchHealthSummary() {
  return fetchJson(apiEndpoints.healthSummary);
}

/**
 * Fetches runtime health details.
 *
 * @returns {Promise<JsonHttpResult>} Runtime health response.
 */
export function fetchRuntimeHealth() {
  return fetchJson(apiEndpoints.runtimeHealth);
}

/**
 * Fetches full persistence health details.
 *
 * @returns {Promise<JsonHttpResult>} Persistence health response.
 */
export function fetchPersistenceHealth() {
  return fetchJson(apiEndpoints.persistenceHealthFull);
}

/**
 * Fetches full dev-notes health details.
 *
 * @returns {Promise<JsonHttpResult>} Dev-notes health response.
 */
export function fetchDevNotesHealth() {
  return fetchJson(apiEndpoints.devNotesHealthFull);
}

/**
 * Fetches the compact backend health summary for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Compact backend health debug response.
 */
export function fetchHealthSummaryDebug() {
  return fetchApiDebugResult(apiEndpoints.healthSummary);
}

/**
 * Fetches runtime health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Runtime health debug response.
 */
export function fetchRuntimeHealthDebug() {
  return fetchApiDebugResult(apiEndpoints.runtimeHealth);
}

/**
 * Fetches full persistence health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Persistence health debug response.
 */
export function fetchPersistenceHealthDebug() {
  return fetchApiDebugResult(apiEndpoints.persistenceHealthFull);
}

/**
 * Fetches full dev-notes health details for diagnostic display.
 *
 * @returns {Promise<ApiDebugResult>} Dev-notes health debug response.
 */
export function fetchDevNotesHealthDebug() {
  return fetchApiDebugResult(apiEndpoints.devNotesHealthFull);
}
