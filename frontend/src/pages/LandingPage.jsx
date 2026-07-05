import { Page, Section, Card, StatusCard, ButtonLink, Icon } from "../components/index.js";

function LandingPage() {
  return (
    <Page
      eyebrow="Milestone 1"
      title="Landing"
      description="Sandbox page for the M1 frontend shell. This page will later show health status cards,
          recent persistent dev-notes and a quick append action."
    >
      <Section
        title="Current Purpose"
        description="This page confirms that routing, layout, icon font setup and HMR are working."
      >
        <div className="card-grid">
          <Card title="Routing">
            <p>The page is loaded through React Router.</p>
          </Card>

          <Card title="Next step">
            <p>Replace this placeholder with the real landing dashboard view later.</p>
          </Card>
        </div>
      </Section>
      <Section
        title="Health Overview"
        description="See Health section for extended health reports."
      >
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
      <Section
        title="Health Icons Demo"
        description="All possible status icons for the health overview section."
      >
        <div className="card-grid card-grid-compact">
          <StatusCard title="Healthy" status="healthy" />
          <StatusCard title="Warning" status="warning" />
          <StatusCard title="Error" status="error" />
          <StatusCard title="Checking" status="checking" />
          <StatusCard title="Unknown" status="unknown" />
        </div>
      </Section>
    </Page>
  );
}

export default LandingPage;
