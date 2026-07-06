import "./Button.css";

/**
 * Renders a generic button.
 *
 * @param {import("./types.js").ButtonProps} props Component props.
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
