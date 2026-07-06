/** @typedef {import("../api/healthApi.js").JsonHttpResult} JsonHttpResult */

/**
 * @typedef {object} LoadingHealthDebugState
 * @property {"loading"} status Current health debug loading state.
 * @property {null} summary Compact health summary response.
 * @property {null} runtime Runtime health response.
 * @property {null} error Request error message.
 */

/**
 * @typedef {object} ReadyHealthDebugState
 * @property {"ready"} status Current health debug ready state.
 * @property {JsonHttpResult} summary Compact health summary response.
 * @property {JsonHttpResult} runtime Runtime health response.
 * @property {null} error Request error message.
 */

/**
 * @typedef {object} ErrorHealthDebugState
 * @property {"error"} status Current health debug error state.
 * @property {null} summary Compact health summary response.
 * @property {null} runtime Runtime health response.
 * @property {string} error Request error message.
 */

/** @typedef {LoadingHealthDebugState | ReadyHealthDebugState | ErrorHealthDebugState} HealthDebugState */

export {};
