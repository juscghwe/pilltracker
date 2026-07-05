import { Section, StatusCard, ButtonLink, Icon } from "../../components/index.js";

function LandingPageHealthOverview() {
  return (
    <Section title="Health Overview" description="See Health section for extended health reports.">
      <div className="card-grid">
        <StatusCard title="Overall Health" status="unknown" />
        <StatusCard title="Frontend Health" status="unknown" />
        <StatusCard title="Prod Backend Health" status="unknown" />
        <StatusCard title="Dev-Notes Backend Health" status="unknown" />
      </div>
      <ButtonLink to="/health">
        <span>To extended report</span>
        <Icon name="arrow_forward" decorative />
      </ButtonLink>
    </Section>
  );
}

export default LandingPageHealthOverview;
