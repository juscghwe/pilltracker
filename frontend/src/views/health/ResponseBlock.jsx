import { JsonBlock, TextBlock } from "../../components/index.js";

/** @typedef {import("../../domain/health.js").HealthDebugEndpointResult} HealthDebugEndpointResult */

/**
 * Displays one fulfilled debug endpoint response.
 *
 * JSON response bodies are shown as structured JSON. Text or HTML responses are shown as escaped
 * plain text.
 *
 * @param {object} props Component props.
 * @param {import("../../domain/health.js").ApiDebugResult} props.value Fulfilled endpoint value.
 * @param {string} props.label Visible response label.
 * @returns {import("react").JSX.Element} Rendered fulfilled response block.
 */
function FulfilledResponseBlock({ value, label }) {
  if (value.bodyKind === "text") {
    return <TextBlock label={`${label} text response`} value={value.rawBody} />;
  }

  return <JsonBlock label={`${label} JSON response`} value={value.body} />;
}

/**
 * Displays one debug endpoint result.
 *
 * Rejected requests are shown as structured JSON because no HTTP response body was available.
 * Fulfilled HTTP responses are rendered based on their parsed body kind.
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
          status: "rejected",
          error: result.error,
        }}
      />
    );
  }

  return <FulfilledResponseBlock value={result.value} label={label} />;
}

export default ResponseBlock;
