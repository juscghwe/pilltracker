/**
 * @typedef {object} CardProps
 * @property {string} [title] Optional card title.
 * @property {import("react").ReactNode} children Card body content.
 * @property {import("react").ReactNode} [actions] Optional card footer actions.
 */

/**
 * Reusable card container.
 *
 * @param {CardProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered card.
 */
function Card({ title, children, actions }) {
  return (
    <section className="app-card">
      {title ? <h4>{title}</h4> : null}
      <div className="app-card-body">{children}</div>
      {actions ? <footer className="app-card-actions">{actions}</footer> : null}
    </section>
  );
}

export default Card;
