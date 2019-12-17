/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/unbound-method */
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { create } from "react-test-renderer";

import { SimpleSubmit } from "../../__fixtures__/components/SimpleSubmit";
import { TestDynamicComponent } from "../../__fixtures__/components/TestDynamicComponent";
import {
  DynamicFormSchema,
  dynamicForm
} from "../../__fixtures__/forms/dynamicForm";
import { staticForm } from "../../__fixtures__/forms/staticForm";

import {
  spyOnDatabaseGet,
  spyOnDatabaseTransaction
} from "../../__tests__/helpers/spies";

import { ComponentDatabaseMap } from "../../component-wrapper/ComponentDatabaseMap";
import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { DynamicComponent } from "../../component-wrapper/DynamicComponent";
import { StaticComponent } from "../../component-wrapper/StaticComponent";
import { Database } from "../../database/Database";
import { NamedSchema } from "../../database/types";
import { DatabaseContext } from "../../database-context/DatabaseContext";
import { DatabaseProvider } from "../../database-context/DatabaseProvider";

import { Step } from "./Step";

jest.mock("../../component-wrapper/ComponentWrapper");
jest.mock("../../database/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open<DynamicFormSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Step
      context={DBContext}
      componentWrappers={dynamicForm.steps[0].componentWrappers}
      Submit={SimpleSubmit}
      afterSubmit={(): void => {}}
    />
  );

  expect(component).toMatchInlineSnapshot(`
    Array [
      <div
        data-testid="test-img"
      >
        Wrapped
         
        img
      </div>,
      <div
        data-testid="test-dynamic-component"
      >
        Wrapped 
        TestDynamicComponent
      </div>,
      <button
        data-testid="submit"
        onClick={[Function]}
      >
        Next step
      </button>,
    ]
  `);
});

it("renders correctly without optional props", () => {
  const component = create(
    <Step
      componentWrappers={staticForm.steps[0].componentWrappers}
      Submit={SimpleSubmit}
    />
  );

  expect(component).toMatchInlineSnapshot(`
    Array [
      <div
        data-testid="test-div"
      >
        Wrapped
         
        div
      </div>,
      <div
        data-testid="test-img"
      >
        Wrapped
         
        img
      </div>,
      <div
        data-testid="test-function"
      >
        Wrapped
         
        TestFunctionComponent
      </div>,
      <div
        data-testid="test-class"
      >
        Wrapped
         
        TestClassComponent
      </div>,
      <button
        data-testid="submit"
        onClick={[Function]}
      >
        Next step
      </button>,
    ]
  `);
});

it("only renders components whose `renderWhen` returns `true` or is undefined", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Step
      context={DBContext}
      componentWrappers={[
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "div-to-render-by-default",
            Component: "div",
            props: {}
          })
        ),
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "div-to-explicitly-render",
            Component: "div",
            props: {},
            renderWhen: (): boolean => true
          })
        ),
        ComponentWrapper.wrapStatic(
          new StaticComponent({
            key: "div-to-not-render",
            Component: "div",
            props: {},
            renderWhen: (): boolean => false
          })
        )
      ]}
      Submit={SimpleSubmit}
    />
  );

  expect(component).toMatchInlineSnapshot(`
    Array [
      <div
        data-testid="div-to-render-by-default"
      >
        Wrapped
         
        div
      </div>,
      <div
        data-testid="div-to-explicitly-render"
      >
        Wrapped
         
        div
      </div>,
      <button
        data-testid="submit"
        onClick={[Function]}
      >
        Next step
      </button>,
    ]
  `);
});

it("calls the after submit callback after submission", () => {
  const afterSubmit = jest.fn();

  const { getByTestId } = render(
    <Step
      componentWrappers={staticForm.steps[0].componentWrappers}
      Submit={SimpleSubmit}
      afterSubmit={afterSubmit}
    />
  );

  fireEvent.click(getByTestId("submit"));

  expect(afterSubmit).toHaveBeenCalledTimes(1);
});

it("calls the after submit callback after submission when it contains dynamic components", async () => {
  const afterSubmit = jest.fn();

  const database = await Database.open<DynamicFormSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <Step
      context={DBContext}
      componentWrappers={dynamicForm.steps[0].componentWrappers}
      Submit={SimpleSubmit}
      afterSubmit={afterSubmit}
    />
  );

  fireEvent.click(getByTestId("submit"));

  expect(afterSubmit).toHaveBeenCalledTimes(1);
});

it("persists data to the database when submitted", async () => {
  const { ComponentWrapper } = jest.requireActual(
    "../../component-wrapper/ComponentWrapper"
  );

  const get = spyOnDatabaseGet();
  const transaction = spyOnDatabaseTransaction();

  type TestSchema = NamedSchema<
    string,
    number,
    {
      testStore: {
        key: number;
        value: string;
      };
    }
  >;

  const databaseMap = new ComponentDatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0
  });

  const wrappers = [
    ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          key: "test-key",
          content: "test content"
        },
        defaultValue: "test default value",
        databaseMap
      })
    )
  ];

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <DatabaseProvider context={DBContext} allowUnmounting>
      <Step
        context={DBContext}
        componentWrappers={wrappers}
        Submit={SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;

  const newValue = "new value";

  fireEvent.change(getByTestId("input"), { target: { value: newValue } });
  fireEvent.click(getByTestId("submit"));

  expect(transaction.spy).toHaveBeenCalledTimes(1);
  expect(transaction.spy).toHaveBeenCalledWith(
    ["testStore"],
    transaction.spy.mock.calls[0][1],
    "readwrite"
  );

  await transaction.settle;

  const store = transaction.stores[databaseMap.storeName];

  expect(store).toBeDefined();

  expect(store.put).toHaveBeenCalledTimes(1);
  expect(store.put).toHaveBeenCalledWith(newValue, databaseMap.key);
});

it("deletes the corresponding data from the database when submitted with the empty value", async () => {
  const { ComponentWrapper } = jest.requireActual(
    "../../component-wrapper/ComponentWrapper"
  );

  const get = spyOnDatabaseGet();
  const transaction = spyOnDatabaseTransaction();

  type TestSchema = NamedSchema<
    string,
    number,
    {
      testStore: {
        key: number;
        value: string;
      };
    }
  >;

  const databaseMap = new ComponentDatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0
  });

  const emptyValue = "test empty value";

  const wrappers = [
    ComponentWrapper.wrapDynamic(
      new DynamicComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          key: "test-key",
          content: "test content"
        },
        defaultValue: "test default value",
        emptyValue,
        databaseMap
      })
    )
  ];

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <DatabaseProvider context={DBContext} allowUnmounting>
      <Step
        context={DBContext}
        componentWrappers={wrappers}
        Submit={SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;

  fireEvent.change(getByTestId("input"), { target: { value: emptyValue } });
  fireEvent.click(getByTestId("submit"));

  expect(transaction.spy).toHaveBeenCalledTimes(1);
  expect(transaction.spy).toHaveBeenCalledWith(
    ["testStore"],
    transaction.spy.mock.calls[0][1],
    "readwrite"
  );

  await transaction.settle;

  const store = transaction.stores[databaseMap.storeName];

  expect(store).toBeDefined();

  expect(store.delete).toHaveBeenCalledTimes(1);
  expect(store.delete).toHaveBeenCalledWith(databaseMap.key);
});
