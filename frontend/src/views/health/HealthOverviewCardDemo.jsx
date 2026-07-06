import { Section, StatusCard } from "../../components/index.js";
import "./HealthOverview.css";

function HealthOverviewCardDemo() {
  return (
    <Section
      title="Health Icons Demo"
      description="All possible status icons for the health overview section."
    >
      <div className="health-overview-grid health-overview-grid-landing">
        <StatusCard title="Healthy" status="healthy" />
        <StatusCard title="Warning" status="warning" />
        <StatusCard title="Error" status="error" />
        <StatusCard title="Checking" status="checking" />
        <StatusCard title="Unknown" status="unknown" />
      </div>
    </Section>
  );
}

export default HealthOverviewCardDemo;
