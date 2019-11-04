import React from "react";
import renderer from "react-test-renderer";

import SlugPage from "../../pages/[slug]";

it("renders correctly with all props", () => {
  const component = renderer.create(
    <SlugPage kittenDimensions={["200", "300"]} />
  );

  expect(component).toMatchSnapshot();
});
