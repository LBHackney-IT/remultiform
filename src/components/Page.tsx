import PropTypes from "prop-types";
import React from "react";

import { PageComponentWrapper } from "../helpers/PageComponentWrapper/PageComponentWrapper";
import { DatabaseContext } from "../helpers/DatabaseContext";

import { NamedSchema, Schema } from "../store/types";

/**
 * The proptypes for {@link Page}.
 */
export interface PageProps<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * A context wrapper for a {@link Database} instance.
   *
   * You must provide this if any of your components are instances of
   * {@link DynamicPageComponent} for them to work as expected.
   */
  context?: DatabaseContext<DBSchema> | null;

  /**
   * An ordered array of wrapped components to display on the page.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link PageComponentWrapper.wrapStatic} or
   * {@link PageComponentWrapper.wrapDynamic}.
   */
  componentWrappers: PageComponentWrapper<DBSchema>[];
}

/**
 * A component for rendering a page of a multipage form.
 */
export const Page = <DBSchema extends NamedSchema<string, number, Schema>>(
  props: PageProps<DBSchema>
): JSX.Element => {
  const { context, componentWrappers } = props;

  if (context) {
    return (
      <context.Consumer>
        {(database): JSX.Element[] =>
          componentWrappers.map(({ render }) => render({ database }))
        }
      </context.Consumer>
    );
  }

  return <>{componentWrappers.map(({ render }) => render({}))}</>;
};

Page.propTypes = {
  context: PropTypes.instanceOf(DatabaseContext),
  componentWrappers: PropTypes.arrayOf(PageComponentWrapper.propType.isRequired)
    .isRequired
} as PropTypes.ValidationMap<PageProps<NamedSchema<string, number, Schema>>>;
