/**
 * @typedef {object} LoadingHealthDebugState
 * @property {"loading"} status Current health debug loading state.
 * @property {null} summary Compact health summary response.
 * @property {null} runtime Runtime health response.
 * @property {null} persistence Persistence health response.
 * @property {null} devnotes Devnotes health response.
 * @property {null} error Request error message.
 */

/**
 * @typedef {object} ReadyHealthDebugState
 * @property {"ready"} status Current health debug ready state.
 * @property {JsonHttpResult} summary Compact health summary response.
 * @property {JsonHttpResult} runtime Runtime health response.
 * @property {JsonHttpResult} persistence Persistence health response.
 * @property {JsonHttpResult} devnotes Devnotes health response.
 * @property {null} error Request error message.
 */

/**
 * @typedef {object} ErrorHealthDebugState
 * @property {"error"} status Current health debug error state.
 * @property {null} summary Compact health summary response.
 * @property {null} runtime Runtime health response.
 * @property {null} persistence Persistence health response.
 * @property {null} devnotes Devnotes health response.
 * @property {string} error Request error message.
 */

/** @typedef {LoadingHealthDebugState | ReadyHealthDebugState | ErrorHealthDebugState} HealthDebugState */

/**
 * Raw health debug report used while the frontend health models are still being stabilized.
 *
 * @typedef {object} HealthDebugReport
 * @property {JsonHttpResult} summary Compact health summary response.
 * @property {JsonHttpResult} runtime Runtime health response.
 * @property {JsonHttpResult} persistence Persistence health response.
 * @property {JsonHttpResult} devnotes Devnotes health response.
 */

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
 * Raw API response wrapper for diagnostic/debug views.
 *
 * @typedef {object} ApiDebugResult
 * @property {boolean} ok Whether the HTTP response status is in the 200-299 range.
 * @property {number} status HTTP response status code.
 * @property {string} path Requested API path.
 * @property {string} contentType Response content type header value.
 * @property {"json" | "text"} bodyKind Parsed response body kind.
 * @property {unknown} body Parsed JSON body or raw text body.
 * @property {string} rawBody Unmodified response body text.
 * @property {string | null} parseError JSON parse error message when parsing failed.
 */

/**
 * Per-endpoint health debug result.
 *
 * @typedef {object} HealthDebugEndpointResult
 * @property {"fulfilled" | "rejected"} status Endpoint request status.
 * @property {ApiDebugResult | null} value Endpoint debug response when fulfilled.
 * @property {string | null} error Request error message when rejected.
 */

/**
 * Raw health debug report used while the frontend health models are still being stabilized.
 *
 * Each endpoint is represented independently so one failed endpoint does not hide the others.
 *
 * @typedef {object} ApiHealthDebugReport
 * @property {HealthDebugEndpointResult} summary Compact health summary response.
 * @property {HealthDebugEndpointResult} runtime Runtime health response.
 * @property {HealthDebugEndpointResult} persistence Persistence health response.
 * @property {HealthDebugEndpointResult} devNotes Dev-notes health response.
 */

export {};
