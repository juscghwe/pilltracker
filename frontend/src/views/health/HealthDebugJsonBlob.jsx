import { useEffect, useState } from "react";

import { Section, Card } from "../../components/index.js";
import { loadHealthDebugReport } from "../../services/healthService.js";
import ResponseBlock from "./ResponseBlock.jsx";

/**
 * Initial health debug view state.
 *
 * @type {import("../../domain/health.js").HealthDebugState}
 */
const initialHealthDebugState = {
  status: "loading",
  report: null,
  error: null,
};

const contentHeads = {
  loading: {
    title: "Loading health reports",
    description: "Checking backend health endpoints...",
  },
  error: {
    title: "Health report failed",
  },
  section: {
    title: "Health Overview",
    description: "Full health reports for debugging purposes.",
  },
  summary: {
    title: "Compact health summary",
    label: "GET /api/health",
  },
  runtime: {
    title: "Runtime health",
    label: "GET /api/health/runtime",
  },
  persistence: {
    title: "Persistence health",
    label: "GET /api/health/persistence?details=full",
  },
  devNotes: {
    title: "Dev-Notes health",
    label: "GET /api/health/dev-notes?details=full",
  },
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
 * @returns {import("react").JSX.Element} Rendered health debug section.
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
            report,
            error: null,
          });
        }
      } catch (error) {
        if (!ignoreResult) {
          setHealth({
            status: "error",
            report: null,
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
      <Section {...contentHeads.section}>
        <Card title={contentHeads.loading.title}>
          <p>{contentHeads.loading.description}</p>
        </Card>
      </Section>
    );
  }

  if (health.status === "error") {
    return (
      <Section {...contentHeads.section}>
        <Card {...contentHeads.error}>
          <p>{health.error}</p>
        </Card>
      </Section>
    );
  }

  return (
    <Section {...contentHeads.section}>
      <Card title={contentHeads.summary.title}>
        <ResponseBlock result={health.report.summary} label={contentHeads.summary.label} />
      </Card>

      <Card title={contentHeads.runtime.title}>
        <ResponseBlock result={health.report.runtime} label={contentHeads.runtime.label} />
      </Card>

      <Card title={contentHeads.persistence.title}>
        <ResponseBlock result={health.report.persistence} label={contentHeads.persistence.label} />
      </Card>

      <Card title={contentHeads.devNotes.title}>
        <ResponseBlock result={health.report.devNotes} label={contentHeads.devNotes.label} />
      </Card>
    </Section>
  );
}

export default HealthDebugJsonBlob;
