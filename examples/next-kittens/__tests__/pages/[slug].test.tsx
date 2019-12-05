import React from "react";
import { create } from "react-test-renderer";

import SlugPage from "../../pages/[slug]";

it("renders correctly with all props", () => {
  const component = create(<SlugPage slug="big-kitten" />);

  expect(component).toMatchInlineSnapshot(`
    Array [
      <img
        src="https://placekitten.com/900/600"
      />,
      <button
        onClick={[Function]}
        onMouseEnter={[Function]}
      >
        Small kitten
      </button>,
    ]
  `);
});
