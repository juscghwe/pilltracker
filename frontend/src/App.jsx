/**
 * Backend health summary returned by `/api/health`.
 *
 * @typedef {object} BackendHealthSummary
 * @property {"healthy" | "unhealthy"} status Overall backend health status.
 * @property {string} service Backend service identifier.
 * @property {object} checks Backend subsystem health checks.
 * @property {object} checks.runtime Runtime health summary.
 * @property {"healthy" | "unhealthy"} checks.runtime.status Runtime health status.
 * @property {number} checks.runtime.uptimeSeconds Runtime uptime in seconds.
 * @property {object} checks.persistence Persistence health summary.
 * @property {"healthy" | "unhealthy"} checks.persistence.status Persistence health status.
 * @property {object} checks.persistence.path Persistence path summary.
 * @property {boolean} checks.persistence.path.isConfigured Whether the persistence path is
 *   configured.
 * @property {string} timestamp Response timestamp.
 */

/**
 * Frontend state while the backend health request is loading.
 *
 * @typedef {object} LoadingHealthState
 * @property {"loading"} status Frontend health request status.
 * @property {null} data Backend health data.
 * @property {null} error Backend health request error message.
 */

/**
 * Frontend state after the backend health request succeeds.
 *
 * @typedef {object} ConnectedHealthState
 * @property {"connected"} status Frontend health request status.
 * @property {BackendHealthSummary} data Backend health data.
 * @property {null} error Backend health request error message.
 */

/**
 * Frontend state after the backend health request fails.
 *
 * @typedef {object} ErrorHealthState
 * @property {"error"} status Frontend health request status.
 * @property {null} data Backend health data.
 * @property {string} error Backend health request error message.
 */

/** @typedef {LoadingHealthState | ConnectedHealthState | ErrorHealthState} HealthState */

import { useEffect, useState } from "react";

/**
 * Initial frontend health request state.
 *
 * @type {HealthState}
 */
const initialHealthState = {
  status: "loading",
  data: null,
  error: null,
};

/**
 * Displays a successful backend health response.
 *
 * @param {object} props Component props.
 * @param {BackendHealthSummary} props.data Backend health summary.
 * @returns {import("react").JSX.Element} Rendered backend health status.
 */
function ConnectedHealthStatus({ data }) {
  const backendIsHealthy = data.status === "healthy";

  return (
    <div className={backendIsHealthy ? "status-connected" : "status-error"} role="status">
      <h2>{backendIsHealthy ? "Backend healthy" : "Backend reachable but unhealthy"}</h2>

      <dl>
        <dt>Status</dt>
        <dd>{data.status}</dd>

        <dt>Service</dt>
        <dd>{data.service}</dd>

        <dt>Runtime</dt>
        <dd>{data.checks.runtime.status}</dd>
        <dd>{data.checks.runtime.uptimeSeconds}</dd>

        <dt>Persistence</dt>
        <dd>{data.checks.persistence.status}</dd>
        <dd>
          {data.checks.persistence.path.isConfigured
            ? "Path is configured"
            : "Path is not configured"}
        </dd>

        <dt>Timestamp</dt>
        <dd>{data.timestamp}</dd>
      </dl>
    </div>
  );
}

/**
 * Root frontend application component.
 *
 * @returns {import("react").JSX.Element} Rendered application shell.
 */
function App() {
  const [health, setHealth] = useState(initialHealthState);

  useEffect(() => {
    let ignoreResult = false;

    async function fetchHealth() {
      try {
        const response = await fetch("/api/health");
        const contentType = response.headers.get("content-type") ?? "";

        if (!contentType.includes("application/json")) {
          throw new Error(`Backend returned non-JSON response! status: ${response.status}`);
        }

        const data = await response.json();

        if (!ignoreResult) {
          setHealth({ status: "connected", data, error: null });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (!ignoreResult) {
          setHealth({ status: "error", data: null, error: message });
        }
      }
    }
    fetchHealth();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="health-card">
        <h1>PillTracker</h1>
        <p>Frontend health check display</p>
        <HealthStatus health={health} />
      </section>
    </main>
  );
}

/**
 * Displays the current backend health request state.
 *
 * @param {object} props Component props.
 * @param {HealthState} props.health Current frontend health state.
 * @returns {import("react").JSX.Element} Rendered health state.
 */
function HealthStatus({ health }) {
  switch (health.status) {
    case "loading":
      return <p>Checking backend connection...</p>;

    case "error":
      return (
        <div className="status-error" role="status">
          <h2>Backend connection failed</h2>
          <p>{health.error}</p>
        </div>
      );

    case "connected":
      return <ConnectedHealthStatus data={health.data} />;

    default:
      throw new Error("Unhandled frontend health state.");
  }
}

export default App;
