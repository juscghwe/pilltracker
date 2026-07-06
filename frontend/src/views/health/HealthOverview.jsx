import { useEffect, useState } from "react";

import { ButtonLink, Icon, Section, StatusCard } from "../../components/index.js";
import { loadHealthSummary } from "../../services/healthService.js";

/** @typedef {import("../../domain/health.js").BackendHealthSummary} BackendHealthSummary */
/** @typedef {import("../../domain/status.js").StatusKind} StatusKind */
/** @typedef {import("../../domain/health.js").HealthOverviewState} HealthOverviewState */

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

const healthOverviewContent = {
  section: {
    title: "Health Overview",
    description: "Compact runtime status for the frontend shell and backend health endpoints.",
  },
  cards: {
    overall: {
      title: "Overall Health",
    },
    frontend: {
      title: "Frontend Health",
    },
    backend: {
      title: "Backend Health",
    },
    devNotes: {
      title: "Dev-Notes Backend Health",
    },
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
 * Maps backend health status values to frontend status card values.
 *
 * @param {"healthy" | "unhealthy" | "disabled" | undefined} status Backend status value.
 * @returns {StatusKind} Frontend status card value.
 */
function mapBackendStatusToStatusKind(status) {
  if (status === "healthy") {
    return "healthy";
  }

  if (status === "unhealthy") {
    return "error";
  }

  if (status === "disabled") {
    return "warning";
  }

  return "unknown";
}

/**
 * Builds a compact backend description from the health summary.
 *
 * @param {BackendHealthSummary} summary Backend health summary.
 * @returns {string} Human-readable backend description.
 */
function getBackendDescription(summary) {
  return [
    `Runtime: ${summary.checks.runtime.status}`,
    `Persistence: ${summary.checks.persistence.status}`,
    `Environment: ${summary.environment}`,
  ].join(" · ");
}

/**
 * Builds a compact dev-notes description from the health summary.
 *
 * @param {BackendHealthSummary} summary Backend health summary.
 * @returns {string} Human-readable dev-notes description.
 */
function getDevNotesDescription(summary) {
  if (!summary.checks.devNotes.enabled) {
    return "Dev-notes subsystem is disabled.";
  }

  return `Dev-notes subsystem is ${summary.checks.devNotes.status}.`;
}

/**
 * Renders loading health overview cards.
 *
 * @returns {import("react").JSX.Element} Rendered loading overview.
 */
function LoadingHealthOverview() {
  return (
    <div className="card-grid">
      <StatusCard
        title={healthOverviewContent.cards.overall.title}
        status="checking"
        description="Checking backend health summary..."
      />
      <StatusCard
        title={healthOverviewContent.cards.frontend.title}
        status="healthy"
        description="Frontend shell rendered successfully."
      />
      <StatusCard
        title={healthOverviewContent.cards.backend.title}
        status="checking"
        description="Waiting for backend health summary..."
      />
      <StatusCard
        title={healthOverviewContent.cards.devNotes.title}
        status="checking"
        description="Waiting for dev-notes health summary..."
      />
    </div>
  );
}

/**
 * Renders error health overview cards.
 *
 * @param {object} props Component props.
 * @param {string} props.error Error message.
 * @returns {import("react").JSX.Element} Rendered error overview.
 */
function ErrorHealthOverview({ error }) {
  return (
    <div className="card-grid">
      <StatusCard
        title={healthOverviewContent.cards.overall.title}
        status="error"
        description="Health summary could not be loaded."
      />
      <StatusCard
        title={healthOverviewContent.cards.frontend.title}
        status="healthy"
        description="Frontend shell rendered successfully."
      />
      <StatusCard
        title={healthOverviewContent.cards.backend.title}
        status="error"
        description={error}
      />
      <StatusCard
        title={healthOverviewContent.cards.devNotes.title}
        status="unknown"
        description="Dev-notes health is unavailable because the summary request failed."
      />
    </div>
  );
}

/**
 * Renders ready health overview cards.
 *
 * @param {object} props Component props.
 * @param {BackendHealthSummary} props.summary Backend health summary.
 * @returns {import("react").JSX.Element} Rendered ready overview.
 */
function ReadyHealthOverview({ summary }) {
  return (
    <div className="card-grid">
      <StatusCard
        title={healthOverviewContent.cards.overall.title}
        status={mapBackendStatusToStatusKind(summary.status)}
        description={`${summary.service} is ${summary.status}.`}
      />
      <StatusCard
        title={healthOverviewContent.cards.frontend.title}
        status="healthy"
        description="Frontend shell rendered successfully."
      />
      <StatusCard
        title={healthOverviewContent.cards.backend.title}
        status={mapBackendStatusToStatusKind(summary.status)}
        description={getBackendDescription(summary)}
      />
      <StatusCard
        title={healthOverviewContent.cards.devNotes.title}
        status={mapBackendStatusToStatusKind(summary.checks.devNotes.status)}
        description={getDevNotesDescription(summary)}
      />
    </div>
  );
}

/**
 * Displays a compact, stateful health overview.
 *
 * @returns {import("react").JSX.Element} Rendered health overview section.
 */
function HealthOverview() {
  const [health, setHealth] = useState(initialHealthOverviewState);

  useEffect(() => {
    let ignoreResult = false;

    /**
     * Loads compact health summary into component state.
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

  return (
    <Section {...healthOverviewContent.section}>
      {health.status === "loading" ? <LoadingHealthOverview /> : null}
      {health.status === "error" ? <ErrorHealthOverview error={health.error} /> : null}
      {health.status === "ready" ? <ReadyHealthOverview summary={health.summary} /> : null}

      <ButtonLink to="/health">
        <span>To extended report</span>
        <Icon name="arrow_forward" decorative />
      </ButtonLink>
    </Section>
  );
}

export default HealthOverview;
