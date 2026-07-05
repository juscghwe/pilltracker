import PageHeader from "./PageHeader.jsx";

/**
 * @typedef {object} PageProps
 * @property {string} [eyebrow] Optional small label above the page title.
 * @property {string} [title] Optional page title.
 * @property {string} [description] Optional page description text.
 * @property {import("react").ReactNode} [actions] Optional page-level actions.
 * @property {import("react").ReactNode} children Page content.
 */

/**
 * Top-level page content wrapper.
 *
 * @param {PageProps} props Component props.
 * @returns {import("react").JSX.Element} Rendered page wrapper.
 */
function Page({ eyebrow, title, description, actions, children }) {
  return (
    <article className="page">
      {title ? (
        <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      ) : null}

      {children}
    </article>
  );
}

export default Page;
