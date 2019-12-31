import PropTypes from "prop-types";

import { ComponentWrapper } from "../component-wrapper/ComponentWrapper";
import { NamedSchema, Schema, StoreNames } from "../database/types";

import { SubmitType } from "./Submit";

/**
 * A step in a multipage form.
 *
 * This represents a single step in the flow of the multipage form.
 */
export interface StepDefinition<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * The slug to uniquely identify the step.
   *
   * This is referenced by {@link OrchestratorProps.initialSlug} and
   * {@link StepDefinition.nextSlug}.
   */
  slug: string;

  /**
   * An ordered array of wrapped components to include in this step.
   *
   * Create {@link ComponentWrapper|ComponentWrappers} with
   * {@link ComponentWrapper.wrapStatic} and
   * {@link ComponentWrapper.wrapDynamic}.
   */
  componentWrappers: ComponentWrapper<DBSchema, StoreName>[];

  /**
   * A submit button or a similar component to be the main call to action, to
   * persist the data and navigate to the next step.
   *
   * This must implement {@link SubmitProps} to function correctly.
   */
  Submit: SubmitType;

  /**
   * The slug of the {@link StepDefinition} that follows this one.
   */
  nextSlug: string;
}

export const stepPropType = PropTypes.exact({
  slug: PropTypes.string.isRequired,
  componentWrappers: PropTypes.arrayOf(ComponentWrapper.propType.isRequired)
    .isRequired,
  Submit: PropTypes.func.isRequired,
  nextSlug: PropTypes.string.isRequired
});
