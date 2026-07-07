/** @typedef {"outlined" | "rounded" | "sharp"} IconFamily */

/**
 * @typedef {object} IconProps
 * @property {string} name Material Symbols ligature name.
 * @property {string} [label] Accessible label. Required unless decorative is true.
 * @property {boolean} [decorative] Whether the icon is purely decorative.
 * @property {IconFamily} [family] Material Symbols family.
 * @property {0 | 1} [fill] Fill axis value.
 * @property {100 | 200 | 300 | 400 | 500 | 600 | 700} [weight] Weight axis value.
 * @property {number} [grade] Grade axis value.
 * @property {number} [opticalSize] Optical size axis value.
 * @property {string} [className] Optional additional CSS class.
 */

/**
 * Renders a generic Material Symbols icon.
 *
 * @param {IconProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered icon.
 */
function Icon({
  name,
  label,
  decorative = false,
  family = "outlined",
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className = "",
}) {
  const familyClassName = `material-symbols-${family}`;
  const iconClassName = `material-symbol ${familyClassName}${className ? ` ${className}` : ""}`;

  return (
    <span
      className={iconClassName}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
      role={decorative ? undefined : "img"}
      style={{
        fontVariationSettings: `"FILL" ${fill}, "wght" ${weight}, "GRAD" ${grade}, "opsz" ${opticalSize}`,
      }}
    >
      {name}
    </span>
  );
}

export default Icon;
