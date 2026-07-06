import { ButtonLink, Icon, Section } from "../../components/index.js";
import { useHealthSummary } from "../../hooks/useHealthSummary.js";
import {
  ErrorHealthOverviewCards,
  LoadingHealthOverviewCards,
  ReadyHealthOverviewCards,
} from "../health/HealthOverviewCards.jsx";
import "../health/HealthOverview.css";

const landingHealthOverviewContent = {
  section: {
    title: "Health Overview",
    description: "Quick system status.",
  },
};

/**
 * Displays a compact landing-page health overview.
 *
 * @returns {import("react").JSX.Element} Rendered landing-page health overview.
 */
function LandingPageHealthOverview() {
  const health = useHealthSummary();

  if (health.status === "loading") {
    return (
      <Section {...landingHealthOverviewContent.section}>
        <div className="health-overview-grid health-overview-grid-landing">
          <LoadingHealthOverviewCards showDescriptions={false} />
        </div>

        <ButtonLink to="/health">
          <span>To extended report</span>
          <Icon name="arrow_forward" decorative />
        </ButtonLink>
      </Section>
    );
  }

  if (health.status === "error") {
    return (
      <Section {...landingHealthOverviewContent.section}>
        <div className="health-overview-grid health-overview-grid-landing">
          <ErrorHealthOverviewCards error={health.error} showDescriptions={false} />
        </div>

        <ButtonLink to="/health">
          <span>To extended report</span>
          <Icon name="arrow_forward" decorative />
        </ButtonLink>
      </Section>
    );
  }

  return (
    <Section {...landingHealthOverviewContent.section}>
      <div className="health-overview-grid health-overview-grid-landing">
        <ReadyHealthOverviewCards summary={health.summary} showDescriptions={false} />
      </div>

      <ButtonLink to="/health">
        <span>To extended report</span>
        <Icon name="arrow_forward" decorative />
      </ButtonLink>
    </Section>
  );
}

export default LandingPageHealthOverview;
