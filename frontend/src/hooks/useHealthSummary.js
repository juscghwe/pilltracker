import { useEffect, useState } from "react";

import { loadHealthSummary } from "../services/healthService.js";

/** @typedef {import("../domain/health.js").HealthOverviewState} HealthOverviewState */

/**
 * Initial health overview state.
 *
 * @type {HealthOverviewState}
 */
const initialHealthOverviewState = {
  status: "loading",
  summary: null,
  error: null,
};

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
 * Loads and tracks the compact backend health summary.
 *
 * @returns {HealthOverviewState} Current health summary state.
 */
export function useHealthSummary() {
  const [health, setHealth] = useState(initialHealthOverviewState);

  useEffect(() => {
    let ignoreResult = false;

    /**
     * Loads compact health summary into hook state.
     *
     * @returns {Promise<void>} Resolves after state has been updated.
     */
    async function loadOverview() {
      try {
        const summary = await loadHealthSummary();

        if (!ignoreResult) {
          setHealth({
            status: "ready",
            summary,
            error: null,
          });
        }
      } catch (error) {
        if (!ignoreResult) {
          setHealth({
            status: "error",
            summary: null,
            error: getErrorMessage(error),
          });
        }
      }
    }

    void loadOverview();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return health;
}
