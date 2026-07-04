/**
 * @typedef {object} PageHeaderProps
 * @property {string} [eyebrow] Optional small label above the page title.
 * @property {string} title Page title.
 * @property {string} [description] Optional page description text.
 * @property {import("react").ReactNode} [actions] Optional page-level actions.
 */

/**
 * Renders the heading area for a page.
 *
 * @param {PageHeaderProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered page header.
 */
function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p className="page-description">{description}</p> : null}
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export default PageHeader;
