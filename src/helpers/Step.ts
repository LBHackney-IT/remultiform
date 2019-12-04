import PropTypes from "prop-types";

import { PageComponentWrapper } from "./PageComponentWrapper/PageComponentWrapper";

import { NamedSchema, Schema, StoreNames } from "../store/types";

import { SubmitType } from "../components/Submit";

/**
 * A step in a multipage form.
 *
 * This represents a single step in the flow of the multipage form.
 */
export interface Step<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DBSchema extends NamedSchema<string, number, Schema> = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StoreName extends StoreNames<DBSchema["schema"]> = any
> {
  /**
   * The slug to uniquely identify the step.
   *
   * This is referenced by {@link OrchestratorProps.initialSlug} and
   * {@link Step.nextSlug}.
   */
  slug: string;

  /**
   * An ordered array of wrapped components to include in this step.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link PageComponentWrapper.wrapStatic} and
   * {@link PageComponentWrapper.wrapDynamic}.
   */
  componentWrappers: PageComponentWrapper<DBSchema, StoreName>[];

  /**
   * A submit button or a similar component to be the main call to action on
   * the page, to persist the data on the page and navigate to the next step.
   *
   * This must implement {@link SubmitProps} to function correctly.
   */
  Submit: SubmitType;

  /**
   * The slug of the {@link Step} that follows this one.
   */
  nextSlug: string;
}

export const stepPropType = PropTypes.exact({
  slug: PropTypes.string.isRequired,
  componentWrappers: PropTypes.arrayOf(PageComponentWrapper.propType.isRequired)
    .isRequired,
  Submit: PropTypes.func.isRequired,
  nextSlug: PropTypes.string.isRequired
});
