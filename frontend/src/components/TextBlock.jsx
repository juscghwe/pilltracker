import "./TextBlock.css";

/**
 * Displays plain text in a bounded, readable debug block.
 *
 * The value is rendered as text inside a code block. HTML-like strings are escaped by React and are
 * never injected into the DOM.
 *
 * @param {object} props Component props.
 * @param {string} props.value Text value to render.
 * @param {string} [props.label] Optional visible block label.
 * @returns {import("react").JSX.Element} Rendered text block.
 */
function TextBlock({ value, label = "Text response" }) {
  return (
    <figure className="text-block">
      <figcaption>{label}</figcaption>
      <pre tabIndex={0}>
        <code>{value}</code>
      </pre>
    </figure>
  );
}

export default TextBlock;
