import { render, fireEvent, waitForElement } from "@testing-library/react";
import React from "react";
import { create } from "react-test-renderer";

import { TestErrorBoundary } from "../__fixtures__/components/TestErrorBoundary";
import {
  DynamicFormSchema,
  dynamicForm
} from "../__fixtures__/forms/dynamicForm";
import { staticForm } from "../__fixtures__/forms/staticForm";

import { spyOnConsoleError } from "../__tests__/helpers/spies";

import { DatabaseContext } from "../helpers/DatabaseContext";
import { Database } from "../store/Database";

import { Orchestrator } from "./Orchestrator";

jest.mock("../helpers/PageComponentWrapper/PageComponentWrapper");
jest.mock("../store/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Orchestrator
      context={DBContext}
      steps={staticForm.steps}
      initialSlug={staticForm.steps[1].slug}
      manageStepTransitions={false}
      onNextStep={(): void => {}}
    />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly without optional props", () => {
  const component = create(<Orchestrator steps={staticForm.steps} />);

  expect(component).toMatchSnapshot();
});

it("renders correctly with steps containing dynamic components", async () => {
  const database = await Database.open<DynamicFormSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Orchestrator context={DBContext} steps={dynamicForm.steps} />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly with steps containing dynamic components without a database context", () => {
  const component = create(<Orchestrator steps={dynamicForm.steps} />);

  expect(component).toMatchSnapshot();
});

it("throws when attempting to render from an unknown slug", () => {
  const consoleErrorSpy = spyOnConsoleError();

  const component = create(
    <TestErrorBoundary>
      <Orchestrator steps={staticForm.steps} initialSlug="unknown-slug" />
    </TestErrorBoundary>
  );

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});

it("renders the next step when the page is submitted", async () => {
  const { container, getByTestId } = render(
    <Orchestrator
      steps={staticForm.steps}
      initialSlug={staticForm.steps[0].slug}
    />
  );

  fireEvent.click(getByTestId("submit"));

  const nextStep = staticForm.steps.find(
    ({ slug }) => slug === staticForm.steps[0].nextSlug
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await waitForElement(() => getByTestId(nextStep!.componentWrappers[0].key));

  expect(container).toMatchSnapshot();
});

it("doesn't render the next step after the page is submitted when `manageStepTransitions` is false", async () => {
  const { container, getByTestId } = render(
    <Orchestrator
      steps={staticForm.steps}
      initialSlug={staticForm.steps[0].slug}
      manageStepTransitions={false}
    />
  );

  fireEvent.click(getByTestId("submit"));

  await waitForElement(() =>
    getByTestId(staticForm.steps[0].componentWrappers[0].key)
  );

  expect(container).toMatchSnapshot();
});

it("calls the `onNextStep` callback after the page is submitted", () => {
  const onNextStep = jest.fn();

  const { getByTestId } = render(
    <Orchestrator
      steps={staticForm.steps}
      initialSlug={staticForm.steps[0].slug}
      onNextStep={onNextStep}
    />
  );

  fireEvent.click(getByTestId("submit"));

  expect(onNextStep).toHaveBeenCalledTimes(1);
  expect(onNextStep).toHaveBeenCalledWith(staticForm.steps[0].nextSlug);
});

it("calls the `onNextStep` callback after the page is submitted when `manageStepTransitions` is false", () => {
  const onNextStep = jest.fn();

  const { getByTestId } = render(
    <Orchestrator
      steps={staticForm.steps}
      initialSlug={staticForm.steps[0].slug}
      manageStepTransitions={false}
      onNextStep={onNextStep}
    />
  );

  fireEvent.click(getByTestId("submit"));

  expect(onNextStep).toHaveBeenCalledTimes(1);
  expect(onNextStep).toHaveBeenCalledWith(staticForm.steps[0].nextSlug);
});
