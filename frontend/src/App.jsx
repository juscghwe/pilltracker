import { useEffect, useState } from "react";

const initialHealthState = {
  status: "loading",
  data: null,
  error: null,
};

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

export default function App() {
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
        if (!ignoreResult) {
          setHealth({ status: "error", data: null, error: error.message });
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
      return (
        <div className="status-error" role="status">
          <h2>Unknown health status</h2>
          <p>{health.status}</p>
        </div>
      );
  }
}
