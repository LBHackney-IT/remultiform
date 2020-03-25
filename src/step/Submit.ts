import PropTypes from "prop-types";
import React from "react";

/**
 * The proptypes for {@link StepDefinition.Submit}.
 */
export interface SubmitProps {
  /**
   * The callback called when submission occurs.
   *
   * This callback is used to execute an asynchronous operation, so the
   * implementation of {@link StepDefinition.Submit} must catch any exceptions
   * thrown by the promise returned by this callback, and handle them
   * appropriately, so they aren't lost to the ether.
   *
   * Returns `true` if the submission succeeded. Otherwise returns `false.
   */
  onSubmit(): Promise<boolean>;
}

/**
 * The type of a component for submitting a {@link StepDefinition}.
 */
// This might have been `React.ElementType<SubmitProps>`, but that creates
// types that are too complicated for TypeScript to resolve. See
// https://github.com/microsoft/TypeScript/issues/33130 for some general
// context.
export type SubmitType = React.ComponentType<SubmitProps>;

/**
 * The proptypes for {@link SubmitType}.
 */
export const submitPropTypes = {
  onSubmit: PropTypes.func.isRequired,
};
