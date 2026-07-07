import { StatusCard } from "../../components/index.js";

/**
 * @typedef {import("../../domain/health.js").BackendHealthSummary} BackendHealthSummary
 *
 * @typedef {import("../../domain/status.js").StatusKind} StatusKind
 */

const healthOverviewCards = {
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
};

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
 * @param {object} props Component props.
 * @param {boolean} [props.showDescriptions] Whether card descriptions should be shown.
 * @returns {import("react").JSX.Element} Rendered loading overview.
 */
export function LoadingHealthOverviewCards({ showDescriptions = true }) {
  return (
    <>
      <StatusCard
        title={healthOverviewCards.overall.title}
        status="checking"
        description={showDescriptions ? "Checking backend health summary..." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.frontend.title}
        status="healthy"
        description={showDescriptions ? "Frontend shell rendered successfully." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.backend.title}
        status="checking"
        description={showDescriptions ? "Waiting for backend health summary..." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.devNotes.title}
        status="checking"
        description={showDescriptions ? "Waiting for dev-notes health summary..." : undefined}
      />
    </>
  );
}

/**
 * Renders error health overview cards.
 *
 * @param {object} props Component props.
 * @param {string} props.error Error message.
 * @param {boolean} [props.showDescriptions] Whether card descriptions should be shown.
 * @returns {import("react").JSX.Element} Rendered error overview.
 */
export function ErrorHealthOverviewCards({ error, showDescriptions = true }) {
  return (
    <>
      <StatusCard
        title={healthOverviewCards.overall.title}
        status="error"
        description={showDescriptions ? "Health summary could not be loaded." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.frontend.title}
        status="healthy"
        description={showDescriptions ? "Frontend shell rendered successfully." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.backend.title}
        status="error"
        description={showDescriptions ? error : undefined}
      />
      <StatusCard
        title={healthOverviewCards.devNotes.title}
        status="unknown"
        description={
          showDescriptions
            ? "Dev-notes health is unavailable because the summary request failed."
            : undefined
        }
      />
    </>
  );
}

/**
 * Renders ready health overview cards.
 *
 * @param {object} props Component props.
 * @param {BackendHealthSummary} props.summary Backend health summary.
 * @param {boolean} [props.showDescriptions] Whether card descriptions should be shown.
 * @returns {import("react").JSX.Element} Rendered ready overview.
 */
export function ReadyHealthOverviewCards({ summary, showDescriptions = true }) {
  return (
    <>
      <StatusCard
        title={healthOverviewCards.overall.title}
        status={mapBackendStatusToStatusKind(summary.status)}
        description={showDescriptions ? `${summary.service} is ${summary.status}.` : undefined}
      />
      <StatusCard
        title={healthOverviewCards.frontend.title}
        status="healthy"
        description={showDescriptions ? "Frontend shell rendered successfully." : undefined}
      />
      <StatusCard
        title={healthOverviewCards.backend.title}
        status={mapBackendStatusToStatusKind(summary.status)}
        description={showDescriptions ? getBackendDescription(summary) : undefined}
      />
      <StatusCard
        title={healthOverviewCards.devNotes.title}
        status={mapBackendStatusToStatusKind(summary.checks.devNotes.status)}
        description={showDescriptions ? getDevNotesDescription(summary) : undefined}
      />
    </>
  );
}
