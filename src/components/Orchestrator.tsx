import PropTypes, { ValidationMap } from "prop-types";
import React, { Key } from "react";

import {
  PageComponentWrapper,
  pageComponentWrapperPropType
} from "../helpers/PageComponentWrapper";

import { Page } from "./Page";

export interface Step {
  key: Key;
  componentWrappers: PageComponentWrapper[];
}

export interface OrchestratorProps {
  currentStepKey?: Key | null;
  steps: Step[];
}

export class Orchestrator extends React.Component<OrchestratorProps> {
  static propTypes: ValidationMap<OrchestratorProps> = {
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
