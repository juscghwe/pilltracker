import { Section, StatusCard } from "../../components/index.js";

function LandingPageStatusCardDemo() {
  return (
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
  );
}

export default LandingPageStatusCardDemo;
