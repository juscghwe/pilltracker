/**
 * @typedef {object} PageProps
 * @property {import("react").ReactNode} children Page content.
 */

/**
 * Top-level page content wrapper.
 *
 * @param {PageProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered page wrapper.
 */
function Page({ children }) {
  return <article className="page">{children}</article>;
}

export default Page;
