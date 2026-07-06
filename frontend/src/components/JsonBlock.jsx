/**
 * Render JSON/debug payloads without letting them eat the whole page.
 *
 * @param {object} props Component props.
 * @param {unknown} props.value Value to render as formatted JSON.
 * @param {string} [props.label] Accessible label for the JSON block.
 * @returns {import("react").JSX.Element} Rendered JSON block.
 */
function JsonBlock({ value, label = "JSON response" }) {
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
