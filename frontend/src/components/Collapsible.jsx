import { useId, useState } from "react";

import Icon from "./Icon.jsx";
import "./Collapsible.css";

/**
 * Reusable collapsible content container.
 *
 * @param {import("./types.js").CollapsibleProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered collapsible container.
 */
function Collapsible({ title, subtitle, iconName, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

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

      <div id={contentId} className="collapsible-content" hidden={!isOpen}>
        {children}
      </div>
    </section>
  );
}

export default Collapsible;
