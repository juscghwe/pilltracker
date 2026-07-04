import { Link } from "react-router";

function NotFoundPage() {
  return (
    <article className="page">
      <header className="page-header">
        <p className="page-eyebrow">404</p>
        <h2>Page not found</h2>
        <p className="page-description">
          This frontend route does not exist. Use the navigation or return to the landing page.
        </p>
      </header>

      <section className="section">
        <section className="app-card">
          <h4>Back to safety</h4>
          <p>
            <Link to="/">Open the landing page</Link>
          </p>
        </section>
      </section>
    </article>
  );
}

export default NotFoundPage;
