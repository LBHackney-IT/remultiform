import React from "react";
import renderer from "react-test-renderer";

import Page from "./Page";

it("renders correctly", () => {
  const component = renderer.create(<Page />);

  expect(component).toMatchSnapshot();
});
