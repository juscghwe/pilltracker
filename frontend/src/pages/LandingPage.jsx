function LandingPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-eyebrow">Milestone 1</p>
        <h2>Landing</h2>
        <p className="page-description">
          Placeholder page for the M1 frontend shell. This page will later show health status cards,
          recent persistent dev-notes, and a quick append action.
        </p>
      </header>

      <section className="section">
        <header className="section-header">
          <h3>Current purpose</h3>
          <p>This page confirms that routing, layout, Material Web setup, and HMR are working.</p>
        </header>

        <div className="card-grid">
          <section className="app-card">
            <h4>Routing</h4>
            <p>The page is loaded through React Router.</p>
          </section>

          <section className="app-card">
            <h4>Next step</h4>
            <p>Replace this placeholder with the real landing dashboard view later.</p>
          </section>
        </div>
      </section>
    </article>
  );
}

export default LandingPage;
