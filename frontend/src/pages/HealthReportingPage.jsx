import { Page, Section, Card } from "../components/index.js";

function HealthReportingPage() {
  return (
    <Page
      eyebrow="Diagnostics"
      title="Health Reporting"
      description="Placeholder page for backend health reporting. This page will later show runtime,
          persistence, and dev-notes health details."
    >
      <Section
        title="Current purpose"
        description="This page confirms that the /health route is working."
      >
        <div className="card-grid">
          <Card title="Summary">
            <p>The compact health summary will be rendered here.</p>
          </Card>

          <Card title="Details">
            <p>Full health endpoint responses will be rendered here later.</p>
          </Card>
        </div>
      </Section>
    </Page>
  );
}

export default HealthReportingPage;
