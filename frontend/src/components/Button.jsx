import "./Button.css";

/**
 * @typedef {object} ButtonProps
 * @property {import("react").ReactNode} children Button label/content.
 * @property {boolean} [filled] Whether the button uses a filled background.
 * @property {import("../domain/button.js").ButtonTone} [tone] Visual tone of the button.
 * @property {import("react").MouseEventHandler<HTMLButtonElement>} [onClick] Optional click
 *   handler.
 * @property {import("../domain/button.js").ButtonType} [type] Native button type.
 * @property {boolean} [disabled] Whether the button is disabled.
 */

/**
 * Renders a generic button.
 *
 * @param {ButtonProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered button.
 */
function Button({
  children,
  filled = false,
  tone = "default",
  onClick,
  type = "button",
  disabled = false,
}) {
  const buttonClassName = [
    "app-button",
    filled ? "app-button-filled" : "app-button-outlined",
    `app-button-${tone}`,
  ].join(" ");

  return (
    <button className={buttonClassName} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
