import { useEffect, useState } from "react";

import { Section, Card, JsonBlock } from "../../components/index.js";
import { loadHealthDebugReport } from "../../services/healthService.js";

/**
 * Initial health debug view state.
 *
 * @type {import("../../domain/health.js").HealthDebugState}
 */
const initialHealthDebugState = {
  status: "loading",
  summary: null,
  runtime: null,
  persistence: null,
  devnotes: null,
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
 * Displays raw health endpoint responses for early frontend/API pipeline validation.
 *
 * @returns {import("react").JSX.Element} Rendered health debug JSON section.
 */
function HealthDebugJsonBlob() {
  const [health, setHealth] = useState(initialHealthDebugState);

  useEffect(() => {
    let ignoreResult = false;

    /**
     * Loads health endpoint responses into component state.
     *
     * @returns {Promise<void>} Resolves after state has been updated.
     */
    async function loadHealth() {
      try {
        const report = await loadHealthDebugReport();

        if (!ignoreResult) {
          setHealth({
            status: "ready",
            summary: report.summary,
            runtime: report.runtime,
            persistence: report.persistence,
            devnotes: report.devnotes,
            error: null,
          });
        }
      } catch (error) {
        if (!ignoreResult) {
          setHealth({
            status: "error",
            summary: null,
            runtime: null,
            persistence: null,
            devnotes: null,
            error: getErrorMessage(error),
          });
        }
      }
    }

    void loadHealth();

    return () => {
      ignoreResult = true;
    };
  }, []);

  if (health.status === "loading") {
    return (
      <Section title="Health Overview" description="Full health reports for debugging purposes.">
        <Card title="Loading health reports">
          <p>Checking backend health endpoints...</p>
        </Card>
      </Section>
    );
  }

  if (health.status === "error") {
    return (
      <Section title="Health Overview" description="Full health reports for debugging purposes.">
        <Card title="Health request failed">
          <p>{health.error}</p>
        </Card>
      </Section>
    );
  }

  return (
    <Section title="Health Overview" description="Full health reports for debugging purposes.">
      <Card title="Compact health summary">
        <JsonBlock value={health.summary} label="GET /api/health" />
      </Card>

      <Card title="Runtime health">
        <JsonBlock value={health.runtime} label="GET /api/health/runtime" />
      </Card>

      <Card title="Persistence health">
        <JsonBlock value={health.persistence} label="GET /api/health/persistence" />
      </Card>

      <Card title="Dev-Notes health">
        <JsonBlock value={health.devnotes} label="GET /api/health/dev-notes" />
      </Card>
    </Section>
  );
}

export default HealthDebugJsonBlob;
