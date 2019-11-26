import React from "react";
import { create } from "react-test-renderer";

import { multiStepForm } from "../__fixtures__/forms/multiStepForm";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";

import { Orchestrator } from "./Orchestrator";

jest.mock("../store/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Orchestrator
      context={DBContext}
      currentStepKey="test-step-2"
      steps={multiStepForm.steps}
    />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly without optional props", () => {
  const component = create(<Orchestrator steps={multiStepForm.steps} />);

  expect(component).toMatchSnapshot();
});
