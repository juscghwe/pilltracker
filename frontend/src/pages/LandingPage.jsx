import { Page, Section, Card } from "../components/index.js";

function LandingPage() {
  return (
    <Page
      eyebrow="Milestone 1"
      title="Landing"
      description="Placeholder page for the M1 frontend shell. This page will later show health status cards,
          recent persistent dev-notes, and a quick append action."
    >
      <Section
        title="Current purpose"
        description="This page confirms that routing, layout, Material Web setup, and HMR are working."
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
    </Page>
  );
}

export default LandingPage;
