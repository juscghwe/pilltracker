import { useId, useState } from "react";

import Icon from "./Icon.jsx";
import "./Collapsible.css";

/**
 * @typedef {object} CollapsibleProps
 * @property {string} title Visible collapsible title.
 * @property {string} [subtitle] Optional collapsible subtitle.
 * @property {string} [iconName] Optional Material Symbols icon name shown before the title.
 * @property {boolean} [defaultOpen] Whether the collapsible starts expanded.
 * @property {boolean} [keepMounted] Whether children stay mounted while collapsed.
 * @property {import("react").ReactNode} children Collapsible body content.
 */

/**
 * Reusable collapsible content container.
 *
 * Children are unmounted while collapsed by default so expensive debug output does not stay mounted
 * unnecessarily. Use `keepMounted` for forms or stateful child components that must preserve local
 * state while collapsed.
 *
 * @param {CollapsibleProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered collapsible container.
 */
function Collapsible({
  title,
  subtitle,
  iconName,
  defaultOpen = false,
  keepMounted = false,
  children,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const shouldRenderChildren = isOpen || keepMounted;

  /**
   * Toggles the collapsible body visibility.
   *
   * @returns {void}
   */
  function toggleOpen() {
    setIsOpen((currentIsOpen) => !currentIsOpen);
  }

  return (
    <section className="collapsible">
      <button
        className="collapsible-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={toggleOpen}
      >
        <span className="collapsible-heading">
          {iconName ? <Icon name={iconName} decorative className="collapsible-logo" /> : null}

          <span className="collapsible-copy">
            <span className="collapsible-title">{title}</span>
            {subtitle ? <span className="collapsible-subtitle">{subtitle}</span> : null}
          </span>
        </span>

        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          label={isOpen ? "Collapse section" : "Expand section"}
          className="collapsible-toggle-icon"
        />
      </button>

      {shouldRenderChildren ? (
        <div id={contentId} className="collapsible-content" hidden={!isOpen}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default Collapsible;
