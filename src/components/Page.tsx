import PropTypes from "prop-types";
import React from "react";

import {
  PageComponentWrapper,
  pageComponentWrapperPropType
} from "../helpers/PageComponentWrapper";

/**
 * The proptypes for {@link Page}.
 *
 * ```ts
 * const pageProps: PageProps = {
 *   componentWrappers: [
 *     wrapPageComponent({
 *       key: "my-image",
 *       Component: "img",
 *       props: {
 *         src: "/path/to/my.png"
 *       }
 *     }),
 *     wrapPageComponent({
 *       key: "my-input",
 *       Component: MyInput,
 *       props: {
 *         defaultValue: "Enter something?"
 *       }
 *     })
 *   ]
 * };
 * ```
 */
export interface PageProps {
  /**
   * An ordered array of wrapped components to display on the page.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link wrapPageComponent}.
   */
  componentWrappers: PageComponentWrapper[];
}

/**
 * A component for rendering a page of a multipage form.
 */
export const Page: React.FunctionComponent<PageProps> = (props: PageProps) => {
  const { componentWrappers } = props;

  return <>{componentWrappers.map(({ key, render }) => render(key))}</>;
};

Page.propTypes = {
  componentWrappers: PropTypes.arrayOf(pageComponentWrapperPropType).isRequired
};
