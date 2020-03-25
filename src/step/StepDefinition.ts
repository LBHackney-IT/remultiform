import PropTypes from "prop-types";

import { ComponentValue } from "../component-wrapper/ComponentDatabaseMap";
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
  componentWrappers: ComponentWrapper<
    DBSchema,
    StoreName,
    ComponentValue<DBSchema, StoreName>
  >[];

  /**
   * An optional function that returns a submit button or a similar component.
   * This should be used for the main call to action, and will persist the data
   * and navigate to the next step when activated.
   *
   * The returned component must implement {@link SubmitProps} to function
   * correctly.
   */
  submit?: ((nextSlug?: string) => SubmitType) | null;

  /**
   * The slug of the {@link StepDefinition} that follows this one or a function
   * that returns it based on the current state of the step's values.
   */
  nextSlug?:
    | ((stepValues: {
        [key: string]:
          | ComponentValue<DBSchema, StoreNames<DBSchema["schema"]>>
          | undefined;
      }) => string)
    | string
    | null;
}

export const stepPropType = PropTypes.exact({
  slug: PropTypes.string.isRequired,
  componentWrappers: PropTypes.arrayOf(ComponentWrapper.propType.isRequired)
    .isRequired,
  submit: PropTypes.func,
  nextSlug: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.func.isRequired,
  ]),
});
