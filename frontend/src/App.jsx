import { useEffect, useState } from "react";

const initialHealthState = {
  status: "loading",
  data: null,
  error: null,
};

export default function App() {
  const [health, setHealth] = useState(initialHealthState);

  useEffect(() => {
    let ignoreResult = false;

    async function fetchHealth() {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error(`Backend returned HTTP error! status: ${response.status}`);
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
      return (
        <div className="status-connected" role="status">
          <h2>Backend connection successful</h2>

          <dl>
            <dt>Status</dt>
            <dd>{health.data.status}</dd>

            <dt>Service</dt>
            <dd>{health.data.service}</dd>

            <dt>Database</dt>
            <dd>{health.data.database}</dd>

            <dt>Timestamp</dt>
            <dd>{health.data.timestamp}</dd>
          </dl>
        </div>
      );

    default:
      return (
        <div className="status-error" role="status">
          <h2>Unknown health status</h2>
          <p>{health.status}</p>
        </div>
      );
  }
}
