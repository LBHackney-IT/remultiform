import React from "react";
import renderer from "react-test-renderer";

import Page from "./Page";

import singleStepForm from "../__fixtures__/forms/singleStepForm";

it("renders correctly with all props", () => {
  const component = renderer.create(
    <Page componentWrappers={singleStepForm.steps[0].componentWrappers} />
  );

  expect(component).toMatchSnapshot();
});
