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
   * Whether the {@link Orchestrator} should wrap the steps in a
   * {@link DatabaseProvider} for you or you want to do that yourself.
   *
   * You might want to disable this if you have pages that exist outside of the
   * {@link Orchestrator}.
   *
   * Defaults to `true`.
   */
  provideDatabase?: boolean | null;

  /**
   * The callback to call when the {@link Orchestrator} is about to transition
   * to the next {@link StepDefinition}.
   *
   * This is called after the step has been submitted, and the
   * {@link Database} transaction has completed. It is called immediately before
   * it renders the new {@link StepDefinition} (if
   * {@link OrchestratorProps.manageStepTransitions} is `true`).
   *
   * Use this for any side effects that you might want when transitioning
   * {@link StepDefinition|steps} and for handling transitions to a
   * {@link StepDefinition.nextSlug} that isn't managed by the
   * {@link Orchestrator}.
   *
   * @param slug - The next {@link StepDefinition.slug}.
   */
  onNextStep?: ((slug?: string) => void) | null;
}

interface OrchestratorState {
  currentSlug?: string;
  nextSlug?: string;
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
    manageStepTransitions: true,
    provideDatabase: true
  };

  state: OrchestratorState = {};

  /**
   * @ignore
   */
  render(): JSX.Element {
    const { context, provideDatabase } = this.props;

    const { slug, nextSlug, componentWrappers, submit } = this.currentStep();

    const step = (
      <Step
        key={slug}
        context={context}
        componentWrappers={componentWrappers}
        submit={submit}
        afterSubmit={(): void => {
          this.handleSubmit();
        }}
        nextSlug={nextSlug}
        onNextSlugChange={(slug?: string): void => {
          this.handleNextSlugChange(slug);
        }}
      />
    );

    if (provideDatabase && context) {
      return <DatabaseProvider context={context}>{step}</DatabaseProvider>;
    }

    return step;
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

  private handleNextSlugChange(slug?: string): void {
    this.setState(state => ({ ...state, nextSlug: slug }));
  }

  private handleSubmit(): void {
    const { steps, manageStepTransitions, onNextStep } = this.props;
    const { nextSlug } = this.state;

    if (onNextStep) {
      onNextStep(nextSlug);
    }

    this.setState(state => ({ ...state, nextSlug: undefined }));

    if (!manageStepTransitions) {
      return;
    }

    if (nextSlug && steps.map(step => step.slug).includes(nextSlug)) {
      this.setState(state => ({ ...state, currentSlug: nextSlug }));
    } else if (!onNextStep) {
      throw new Error(
        `Unable to transition to next slug "${nextSlug}" due to it not ` +
          "existing in the managed steps, and there is no onNextStep prop to " +
          "call instead"
      );
    }
  }
}
