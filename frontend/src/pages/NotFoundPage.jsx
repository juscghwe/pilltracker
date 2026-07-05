import { Link } from "react-router";
import { Page, Section, Card } from "../components/index.js";

function NotFoundPage() {
  return (
    <Page
      eyebrow="404"
      title="Page not found"
      description="This frontend route does not exist. Use the navigation or return to the landing page.
        "
    >
      <Section>
        <Card title="Back to safety">
          <p>
            <Link to="/">Open the landing page</Link>
          </p>
        </Card>
      </Section>
    </Page>
  );
}

export default NotFoundPage;
