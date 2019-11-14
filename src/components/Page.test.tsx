import React from "react";
import { create } from "react-test-renderer";

import { singleStepForm } from "../__fixtures__/forms/singleStepForm";

import { Page } from "./Page";

it("renders correctly with all props", () => {
  const component = create(
    <Page componentWrappers={singleStepForm.steps[0].componentWrappers} />
  );

  expect(component).toMatchSnapshot();
});
