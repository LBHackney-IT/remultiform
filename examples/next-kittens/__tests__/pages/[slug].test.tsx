import React from "react";
import { create } from "react-test-renderer";

import SlugPage from "../../pages/[slug]";

it("renders correctly with all props", () => {
  const component = create(<SlugPage slug="big-kitten" />);

  expect(component).toMatchSnapshot();
});
