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
 * Health debug endpoint result when the endpoint request completed.
 *
 * The HTTP response itself may still be unhealthy, non-2xx, or contain non-JSON debug output.
 *
 * @typedef {object} FulfilledHealthDebugEndpointResult
 * @property {"fulfilled"} status Endpoint request state.
 * @property {ApiDebugResult} value Raw endpoint debug response.
 * @property {null} error Request error message.
 */

/**
 * Health debug endpoint result when the endpoint request failed before a response was usable.
 *
 * @typedef {object} RejectedHealthDebugEndpointResult
 * @property {"rejected"} status Endpoint request state.
 * @property {null} value Raw endpoint debug response.
 * @property {string} error Request error message.
 */

/**
 * Per-endpoint health debug result.
 *
 * @typedef {FulfilledHealthDebugEndpointResult | RejectedHealthDebugEndpointResult} HealthDebugEndpointResult
 */

/**
 * Raw health debug report used while frontend health models are still being stabilized.
 *
 * Each endpoint is represented independently so one failed endpoint does not hide the others.
 *
 * @typedef {object} HealthDebugReport
 * @property {HealthDebugEndpointResult} summary Compact health summary response.
 * @property {HealthDebugEndpointResult} runtime Runtime health response.
 * @property {HealthDebugEndpointResult} persistence Persistence health response.
 * @property {HealthDebugEndpointResult} devNotes Dev-notes health response.
 */

/**
 * Health debug state while endpoint requests are loading.
 *
 * @typedef {object} LoadingHealthDebugState
 * @property {"loading"} status Current health debug loading state.
 * @property {null} report Health debug report.
 * @property {null} error Request error message.
 */

/**
 * Health debug state after endpoint requests complete.
 *
 * Individual endpoints inside the report may still be rejected.
 *
 * @typedef {object} ReadyHealthDebugState
 * @property {"ready"} status Current health debug ready state.
 * @property {HealthDebugReport} report Health debug report.
 * @property {null} error Request error message.
 */

/**
 * Health debug state when the whole health report failed unexpectedly.
 *
 * This should be uncommon because endpoint failures should normally be captured inside the report.
 *
 * @typedef {object} ErrorHealthDebugState
 * @property {"error"} status Current health debug error state.
 * @property {null} report Health debug report.
 * @property {string} error Request error message.
 */

/**
 * Health debug view state.
 *
 * @typedef {LoadingHealthDebugState | ReadyHealthDebugState | ErrorHealthDebugState} HealthDebugState
 */

export {};
