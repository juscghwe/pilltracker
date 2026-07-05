import Card from "./Card.jsx";
import StatusIcon from "./StatusIcon.jsx";

/**
 * @typedef {object} StatusCardProps
 * @property {string} title Status card title.
 * @property {import("../domain/status.js").StatusKind} status Short status label.
 * @property {string} [description] Optional status description.
 * @property {import("react").ReactNode} [actions] Optional card actions.
 */

/**
 * Renders a status-focused card using the shared Card container.
 *
 * @param {StatusCardProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered status card.
 */
function StatusCard({ title, status, description, actions }) {
  return (
    <Card title={title} actions={actions}>
      <StatusIcon status={status} />
      <p className="status-card-status">{status}</p>
      {description ? <p className="status-card-description">{description}</p> : null}
    </Card>
  );
}

export default StatusCard;
