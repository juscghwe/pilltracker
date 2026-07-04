function HealthReportingPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-eyebrow">Diagnostics</p>
        <h2>Health Reporting</h2>
        <p className="page-description">
          Placeholder page for backend health reporting. This page will later show runtime,
          persistence, and dev-notes health details.
        </p>
      </header>

      <section className="section">
        <header className="section-header">
          <h3>Current purpose</h3>
          <p>This page confirms that the /health route is working.</p>
        </header>

        <div className="card-grid">
          <section className="app-card">
            <h4>Summary</h4>
            <p>The compact health summary will be rendered here.</p>
          </section>

          <section className="app-card">
            <h4>Details</h4>
            <p>Full health endpoint responses will be rendered here later.</p>
          </section>
        </div>
      </section>
    </article>
  );
}

export default HealthReportingPage;
