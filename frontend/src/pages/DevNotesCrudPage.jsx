import { Page, Section, Card } from "../components/index.js";

function DevNotesCrudPage() {
  return (
    <Page
      eyebrow="Development tool"
      title="DevNotes CRUD"
      description="Placeholder page for the dev-notes CRUD playground. This page will later exercise temp and
          persistent storage through all supported dev-notes HTTP methods."
    >
      <Section
        title="Current purpose"
        description="This page confirms that the /dev-notes route is working."
      >
        <div className="card-grid">
          <Card title="Storage targets">
            <p>Temp and persistent storage controls will be added here.</p>
          </Card>

          <Card title="Methods">
            <p>GET, POST, PUT, PATCH, DELETE, OPTIONS and raw responses will be added later.</p>
          </Card>
        </div>
      </Section>
    </Page>
  );
}

export default DevNotesCrudPage;
