import PropTypes from "prop-types";
import React from "react";

import { NamedSchema, Schema, StoreNames } from "../database/types";
import { DatabaseContext } from "../database-context/DatabaseContext";
import { DatabaseProvider } from "../database-context/DatabaseProvider";
import { Step } from "../step/internal/Step";
import { StepDefinition, stepPropType } from "../step/StepDefinition";

/**
 * The proptypes for {@link Orchestrator}.
 */
export interface OrchestratorProps<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> {
  /**
   * A context wrapper for a {@link Database} instance.
   *
   * You must provide this if any of your components are instances of
   * {@link DynamicComponent} for them to work as expected.
   */
  context?: DatabaseContext<DBSchema> | null;

  /**
   * An array of steps to render.
   */
  steps: StepDefinition<DBSchema, StoreName>[];

  /**
   * The {@link StepDefinition.slug} to start the form on.
   *
   * Defaults to the slug of the first {@link StepDefinition} in
   * {@link OrchestratorProps.steps}.
   */
  initialSlug?: string | null;

  /**
   * Whether the {@link Orchestrator} should manage {@link StepDefinition} transitions or
   * you want to manage them yourself via routing, for example.
   *
   * Defaults to `true`.
   */
  manageStepTransitions?: boolean | null;

  /**
   * The callback to call when the {@link Orchestrator} is about to transition
   * to the next {@link StepDefinition}.
   *
   * This is called after the step has been submitted, and the
   * {@link Database} transaction has completed.
   *
   * If {@link OrchestratorProps.manageStepTransitions} is `true` this is
   * called immediately before it renders the new {@link StepDefinition}.
   *
   * Use this for any side effects that you might want when transitioning
   * {@link StepDefinition|Steps}.
   *
   * @param slug - The next {@link StepDefinition.slug}.
   */
  onNextStep?: ((slug: string) => void) | null;
}

interface OrchestratorState {
  currentSlug?: string;
}

/**
 * A component for orchestrating the rendering of
 * {@link StepDefinition|StepDefinitions} for a multipage form.
 */
export class Orchestrator<
  DBSchema extends NamedSchema<string, number, Schema>,
  StoreName extends StoreNames<DBSchema["schema"]>
> extends React.Component<
  OrchestratorProps<DBSchema, StoreName>,
  OrchestratorState,
  never
> {
  static propTypes: PropTypes.ValidationMap<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OrchestratorProps<NamedSchema<string, number, any>, string>
  > = {
    context: PropTypes.instanceOf(DatabaseContext),
    steps: PropTypes.arrayOf(stepPropType.isRequired).isRequired,
    initialSlug: PropTypes.string,
    manageStepTransitions: PropTypes.bool,
    onNextStep: PropTypes.func
  };

  static defaultProps: Partial<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OrchestratorProps<NamedSchema<string, number, any>, string>
  > = {
    manageStepTransitions: true
  };

  state: OrchestratorState = {};

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { context } = this.props;

    const { slug, componentWrappers, Submit } = this.currentStep();

    if (context) {
      return (
        <DatabaseProvider context={context}>
          <Step
            key={slug}
            context={context}
            componentWrappers={componentWrappers}
            Submit={Submit}
            afterSubmit={(): void => {
              this.handleSubmit();
            }}
          />
        </DatabaseProvider>
      );
    }

    return (
      <Step
        key={slug}
        componentWrappers={componentWrappers}
        Submit={Submit}
        afterSubmit={(): void => {
          this.handleSubmit();
        }}
      />
    );
  }

  private currentStep(): StepDefinition<DBSchema, StoreName> {
    const { steps, initialSlug, manageStepTransitions } = this.props;

    let currentSlug = initialSlug;

    if (manageStepTransitions && this.state.currentSlug) {
      currentSlug = this.state.currentSlug;
    }

    if (!currentSlug) {
      return steps[0];
    }

    const step = steps.find(({ slug }) => slug === currentSlug);

    if (!step) {
      throw new Error(`Step with slug "${currentSlug}" could not be found`);
    }

    return step;
  }

  private handleSubmit(): void {
    const { manageStepTransitions, onNextStep } = this.props;
    const { nextSlug } = this.currentStep();

    if (onNextStep) {
      onNextStep(nextSlug);
    }

    if (manageStepTransitions) {
      this.setState(state => ({ ...state, currentSlug: nextSlug }));
    }
  }
}
