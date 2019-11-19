import PropTypes from "prop-types";
import React from "react";

import {
  PageComponentWrapper,
  pageComponentWrapperPropType
} from "../helpers/PageComponentWrapper";

import { Page } from "./Page";

/**
 * A step in a multipage form.
 *
 * This represents a single step in the flow of the multipage form.
 *
 * ```ts
 * const step: Step = {
 *   key: "step-1",
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
export interface Step {
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
   * {@link wrapPageComponent}.
   */
  componentWrappers: PageComponentWrapper[];
}

/**
 * The proptypes for {@link Orchestrator}.
 */
export interface OrchestratorProps {
  /**
   * The key of the current step to be rendered.
   */
  currentStepKey?: React.Key | null;

  /**
   * An array of steps to possibly render based on
   * {@link OrchestratorProps.currentStepKey}.
   */
  steps: Step[];
}

/**
 * A component for orchestrating the rendering of pages for a multipage form.
 *
 * ```ts
 * const form: React.FunctionComponent = () => {
 *   return (
 *     <Orchestrator
 *       currentStepKey="step-2"
 *       steps={[
 *         {
 *           key: "step-1",
 *           componentWrappers: [
 *             wrapPageComponent({
 *               key: "my-image",
 *               Component: "img",
 *               props: {
 *                 src: "/path/to/my.png"
 *               }
 *             }),
 *             wrapPageComponent({
 *               key: "my-input",
 *               Component: MyInput,
 *               props: {
 *                 defaultValue: "Enter something?"
 *               }
 *             })
 *           ]
 *         },
 *         {
 *           key: "step-2",
 *           componentWrappers: [
 *             wrapPageComponent({
 *               key: "my-input",
 *               Component: MyInput,
 *               props: {
 *                 defaultValue: "Enter something else?"
 *               }
 *             })
 *           ]
 *         }
 *       ]}
 *     />
 *   )
 * }
 */
export const Orchestrator: React.FunctionComponent<OrchestratorProps> = (
  props: OrchestratorProps
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
      componentWrappers: PropTypes.arrayOf(pageComponentWrapperPropType)
        .isRequired
    }).isRequired
  ).isRequired
};
