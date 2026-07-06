import { Section } from "../../components/index.js";
import { useHealthSummary } from "../../hooks/useHealthSummary.js";
import {
  ErrorHealthOverviewCards,
  LoadingHealthOverviewCards,
  ReadyHealthOverviewCards,
} from "./HealthOverviewCards.jsx";
import "./HealthOverview.css";

const healthOverviewContent = {
  section: {
    title: "Health Overview",
    description: "Compact runtime status for the frontend shell and backend health endpoints.",
  },
};

/**
 * Displays a detailed, stateful health overview for the health reporting page.
 *
 * @returns {import("react").JSX.Element} Rendered health overview section.
 */
function HealthOverview() {
  const health = useHealthSummary();

  if (health.status === "loading") {
    return (
      <Section {...healthOverviewContent.section}>
        <div className="health-overview-grid health-overview-grid-detailed">
          <LoadingHealthOverviewCards />
        </div>
      </Section>
    );
  }

  if (health.status === "error") {
    return (
      <Section {...healthOverviewContent.section}>
        <div className="health-overview-grid health-overview-grid-detailed">
          <ErrorHealthOverviewCards error={health.error} />
        </div>
      </Section>
    );
  }

  return (
    <Section {...healthOverviewContent.section}>
      <div className="health-overview-grid health-overview-grid-detailed">
        <ReadyHealthOverviewCards summary={health.summary} />
      </div>
    </Section>
  );
}

export default HealthOverview;
