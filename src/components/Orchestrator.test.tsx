import React from "react";
import { create } from "react-test-renderer";

import multiStepForm from "../__fixtures__/forms/multiStepForm";

import Orchestrator from "./Orchestrator";

it("renders correctly with all props", () => {
  const component = create(
    <Orchestrator currentStepKey="test-step-2" steps={multiStepForm.steps} />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly without `currentStepKey`", () => {
  const component = create(<Orchestrator steps={multiStepForm.steps} />);

  expect(component).toMatchSnapshot();
});
