function DevNotesCrudPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-eyebrow">Development tool</p>
        <h2>DevNotes CRUD</h2>
        <p className="page-description">
          Placeholder page for the dev-notes CRUD playground. This page will later exercise temp and
          persistent storage through all supported dev-notes HTTP methods.
        </p>
      </header>

      <section className="section">
        <header className="section-header">
          <h3>Current purpose</h3>
          <p>This page confirms that the /dev-notes route is working.</p>
        </header>

        <div className="card-grid">
          <section className="app-card">
            <h4>Storage targets</h4>
            <p>Temp and persistent storage controls will be added here.</p>
          </section>

          <section className="app-card">
            <h4>Methods</h4>
            <p>GET, POST, PUT, PATCH, DELETE, OPTIONS and raw responses will be added later.</p>
          </section>
        </div>
      </section>
    </article>
  );
}

export default DevNotesCrudPage;
