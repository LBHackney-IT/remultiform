import PropTypes from "prop-types";
import React from "react";

import {
  PageComponentWrapper,
  pageComponentWrapperPropType
} from "../helpers/PageComponentWrapper";

import { Page } from "./Page";

export interface Step {
  key: React.Key;
  componentWrappers: PageComponentWrapper[];
}

export interface OrchestratorProps {
  currentStepKey?: React.Key | null;
  steps: Step[];
}

export class Orchestrator extends React.Component<
  OrchestratorProps,
  never,
  never
> {
  static propTypes: PropTypes.ValidationMap<OrchestratorProps> = {
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

  render(): JSX.Element {
    const { currentStepKey, steps } = this.props;

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
  }
}
