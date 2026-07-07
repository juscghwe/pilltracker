/** @typedef {import("../domain/httpclient.js").JsonHttpResult} JsonHttpResult */
/** @typedef {import("../domain/httpclient.js").ApiDebugResult} ApiDebugResult */

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

/** @typedef {"healthy" | "unhealthy"} BackendHealthStatus */
/** @typedef {"healthy" | "unhealthy" | "disabled"} DevNotesHealthStatus */

/**
 * Health overview state while the summary request is loading.
 *
 * @typedef {object} LoadingHealthOverviewState
 * @property {"loading"} status Current health overview loading state.
 * @property {null} summary Backend health summary.
 * @property {null} error Request error message.
 */

/**
 * Health overview state after the summary request completed.
 *
 * @typedef {object} ReadyHealthOverviewState
 * @property {"ready"} status Current health overview ready state.
 * @property {BackendHealthSummary} summary Backend health summary.
 * @property {null} error Request error message.
 */

/**
 * Health overview state when the summary request failed.
 *
 * @typedef {object} ErrorHealthOverviewState
 * @property {"error"} status Current health overview error state.
 * @property {null} summary Backend health summary.
 * @property {string} error Request error message.
 */

/**
 * Health overview view state.
 *
 * @typedef {LoadingHealthOverviewState | ReadyHealthOverviewState | ErrorHealthOverviewState} HealthOverviewState
 */
/**
 * Compact runtime health summary returned by `/api/health`.
 *
 * @typedef {object} RuntimeHealthSummaryCheck
 * @property {BackendHealthStatus} status Runtime health status.
 * @property {number} uptimeSeconds Node.js process uptime in seconds.
 */

/**
 * Compact persistence health summary returned by `/api/health`.
 *
 * @typedef {object} PersistenceHealthSummaryCheck
 * @property {BackendHealthStatus} status Persistence health status.
 * @property {{ isConfigured: boolean }} path Persistence path summary.
 */

/**
 * Compact dev-notes health summary returned by `/api/health`.
 *
 * @typedef {object} DevNotesHealthSummaryCheck
 * @property {DevNotesHealthStatus} status Dev-notes health status.
 * @property {boolean} enabled Whether dev-notes is enabled.
 */

/**
 * Compact health summary checks returned by `/api/health`.
 *
 * @typedef {object} HealthSummaryChecks
 * @property {RuntimeHealthSummaryCheck} runtime Runtime health summary.
 * @property {PersistenceHealthSummaryCheck} persistence Persistence health summary.
 * @property {DevNotesHealthSummaryCheck} devNotes Dev-notes health summary.
 */

/**
 * Compact backend health summary returned by `/api/health`.
 *
 * @typedef {object} BackendHealthSummary
 * @property {BackendHealthStatus} status Overall backend readiness.
 * @property {string} service Service identifier.
 * @property {string} environment Runtime environment.
 * @property {HealthSummaryChecks} checks Subsystem health checks.
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
