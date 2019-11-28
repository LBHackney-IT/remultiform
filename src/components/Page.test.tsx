import React from "react";
import { create } from "react-test-renderer";

import { singleStepForm } from "../__fixtures__/forms/singleStepForm";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";

import { Page } from "./Page";

jest.mock("../store/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Page
      context={DBContext}
      componentWrappers={singleStepForm.steps[0].componentWrappers}
    />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly without optional props", () => {
  const component = create(
    <Page componentWrappers={singleStepForm.steps[0].componentWrappers} />
  );

  expect(component).toMatchSnapshot();
});
