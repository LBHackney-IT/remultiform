import PropTypes from "prop-types";
import React from "react";

import { PageComponentWrapper } from "../helpers/PageComponentWrapper/PageComponentWrapper";

/**
 * The proptypes for {@link Page}.
 */
export interface PageProps {
  /**
   * An ordered array of wrapped components to display on the page.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic}.
   */
  componentWrappers: PageComponentWrapper[];
}

/**
 * A component for rendering a page of a multipage form.
 */
export const Page: React.FunctionComponent<PageProps> = (props: PageProps) => {
  const { componentWrappers } = props;

  return <>{componentWrappers.map(({ element }) => element)}</>;
};

Page.propTypes = {
  componentWrappers: PropTypes.arrayOf(PageComponentWrapper.propType.isRequired)
    .isRequired
};
