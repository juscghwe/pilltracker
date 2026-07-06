import "./JsonBlock.css";

/**
 * Displays a JSON-compatible value in a bounded, readable debug block.
 *
 * @param {object} props Component props.
 * @param {unknown} props.value Value to render as formatted JSON.
 * @param {string} [props.label] Optional visible block label.
 * @returns {import("react").JSX.Element} Rendered JSON block.
 */
function JsonBlock({ value, label = "JSON" }) {
  return (
    <figure className="json-block">
      <figcaption>{label}</figcaption>
      <pre tabIndex={0}>
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    </figure>
  );
}

export default JsonBlock;
