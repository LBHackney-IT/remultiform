import PropTypes from "prop-types";
import React from "react";

import { PageComponentWrapper } from "../helpers/PageComponentWrapper/PageComponentWrapper";

import { NamedSchema, Schema } from "../store/types";

import { Page } from "./Page";

/**
 * A step in a multipage form.
 *
 * This represents a single step in the flow of the multipage form.
 */
export interface Step<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DBSchema extends NamedSchema<string, number, Schema> = any
> {
  /**
   * The key to uniquely identify the step
   *
   * This is referenced by {@link OrchestratorProps.currentStepKey}.
   */
  key: React.Key;

  /**
   * An ordered array of wrapped components to include in this step.
   *
   * Create {@link PageComponentWrapper|PageComponentWrappers} with
   * {@link PageComponentWrapper.wrapStatic} and
   * {@link PageComponentWrapper.wrapDynamic}.
   */
  componentWrappers: PageComponentWrapper<DBSchema>[];
}

/**
 * The proptypes for {@link Orchestrator}.
 */
export interface OrchestratorProps<
  DBSchema extends NamedSchema<string, number, Schema>
> {
  /**
   * The key of the current step to be rendered.
   */
  currentStepKey?: React.Key | null;

  /**
   * An array of steps to possibly render based on
   * {@link OrchestratorProps.currentStepKey}.
   */
  steps: Step<DBSchema>[];
}

/**
 * A component for orchestrating the rendering of pages for a multipage form.
 */
export const Orchestrator = <
  DBSchema extends NamedSchema<string, number, Schema>
>(
  props: OrchestratorProps<DBSchema>
): JSX.Element => {
  const { currentStepKey, steps } = props;

  const currentStep =
    steps.find(({ key }) => key === currentStepKey) || steps[0];

  return (
    <>
      <Page
        key={currentStep.key}
        componentWrappers={currentStep.componentWrappers}
      />
    </>
  );
};

Orchestrator.propTypes = {
  currentStepKey: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.exact({
      key: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired
      ]).isRequired,
      componentWrappers: PropTypes.arrayOf(
        PageComponentWrapper.propType.isRequired
      ).isRequired
    }).isRequired
  ).isRequired
} as PropTypes.ValidationMap<
  OrchestratorProps<NamedSchema<string, number, Schema>>
>;
