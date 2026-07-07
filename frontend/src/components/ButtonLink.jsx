import { Link } from "react-router";
import "./Button.css";

/**
 * @typedef {object} ButtonLinkProps
 * @property {string} to Internal app route.
 * @property {import("react").ReactNode} children Link content.
 * @property {boolean} [filled] Whether the link uses a filled background.
 * @property {import("./types.js").ButtonTone} [tone] Visual tone.
 */

/**
 * Renders an internal navigation link styled as a button.
 *
 * @param {ButtonLinkProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered button-like link.
 */
function ButtonLink({ to, children, filled = false, tone = "default" }) {
  const buttonClassName = [
    "app-button",
    filled ? "app-button-filled" : "app-button-outlined",
    `app-button-${tone}`,
  ].join(" ");

  return (
    <Link className={buttonClassName} to={to}>
      {children}
    </Link>
  );
}

export default ButtonLink;
