import "./Section.css";

/**
 * @typedef {object} SectionProps
 * @property {string} [title] Optional section title.
 * @property {string} [description] Optional section description text.
 * @property {import("react").ReactNode} children Section content.
 */

/**
 * Groups related page content.
 *
 * @param {SectionProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered section.
 */
function Section({ title, description, children }) {
  return (
    <section className="section">
      {(title || description) && (
        <header className="section-header">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </header>
      )}

      {children}
    </section>
  );
}

export default Section;
