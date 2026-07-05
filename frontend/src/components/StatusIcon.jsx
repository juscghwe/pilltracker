import Icon from "./Icon.jsx";

/** @typedef {"healthy" | "warning" | "error" | "checking" | "unknown"} StatusKind */

/**
 * @typedef {object} StatusIconProps
 * @property {StatusKind} status Status kind.
 * @property {"outlined" | "rounded" | "sharp"} [family] Material Symbols family.
 */

const statusIconMap = {
  healthy: {
    name: "check_circle",
    label: "Healthy",
  },
  warning: {
    name: "warning",
    label: "Warning",
  },
  error: {
    name: "error",
    label: "Error",
  },
  checking: {
    name: "sync",
    label: "Checking",
  },
  unknown: {
    name: "help",
    label: "Unknown",
  },
};

/**
 * Renders a status-specific icon.
 *
 * @param {StatusIconProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered status icon.
 */
function StatusIcon({ status, family = "outlined" }) {
  const icon = statusIconMap[status] ?? statusIconMap.unknown;

  return (
    <Icon
      name={icon.name}
      label={icon.label}
      family={family}
      className={`status-icon status-icon-${status}`}
      fill={status === "error" ? 1 : 0}
      weight={500}
    />
  );
}

export default StatusIcon;
