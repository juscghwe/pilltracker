import { JsonBlock } from "../../components/index.js";

/** @typedef {import("../../domain/health.js").HealthDebugEndpointResult} HealthDebugEndpointResult */

/**
 * Displays one debug endpoint result.
 *
 * Successful JSON/debug responses are shown as structured JSON. Rejected requests are shown as
 * plain error data. Raw HTML/text bodies stay escaped because they are rendered as text inside the
 * JSON block, never injected into the DOM.
 *
 * @param {object} props Component props.
 * @param {HealthDebugEndpointResult} props.result Endpoint debug result.
 * @param {string} props.label Visible response label.
 * @returns {import("react").JSX.Element} Rendered response block.
 */
function ResponseBlock({ result, label }) {
  if (result.status === "rejected") {
    return (
      <JsonBlock
        label={`${label} request failed`}
        value={{
          status: result.status,
          error: result.error,
        }}
      />
    );
  }

  return <JsonBlock label={label} value={result.value} />;
}

export default ResponseBlock;
