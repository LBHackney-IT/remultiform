/* eslint-disable @typescript-eslint/unbound-method */
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { create } from "react-test-renderer";

import { SimpleSubmit } from "../__fixtures__/components/SimpleSubmit";
import { TestDynamicComponent } from "../__fixtures__/components/TestDynamicComponent";
import { dynamicForm } from "../__fixtures__/forms/dynamicForm";
import { staticForm } from "../__fixtures__/forms/staticForm";

import {
  spyOnDatabaseGet,
  spyOnDatabaseTransaction
} from "../__tests__/helpers/spies";

import { DatabaseMap } from "../helpers/PageComponentWrapper/DatabaseMap";
import { DynamicPageComponent } from "../helpers/PageComponentWrapper/DynamicPageComponent";
import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { NamedSchema } from "../store/types";

import { Page } from "./Page";
import { DatabaseProvider } from "./DatabaseProvider";

jest.mock("../helpers/PageComponentWrapper/PageComponentWrapper");
jest.mock("../store/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Page
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
        Next page
      </button>,
    ]
  `);
});

it("renders correctly without optional props", () => {
  const component = create(
    <Page
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
        Next page
      </button>,
    ]
  `);
});

it("calls the after submit callback after submission", () => {
  const afterSubmit = jest.fn();

  const { getByTestId } = render(
    <Page
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

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <Page
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
  const { PageComponentWrapper } = jest.requireActual(
    "../helpers/PageComponentWrapper/PageComponentWrapper"
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

  const databaseMap = new DatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0
  });

  const wrappers = [
    PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          key: "test-key",
          content: "test content"
        },
        databaseMap
      })
    )
  ];

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <DatabaseProvider context={DBContext} allowUnmounting>
      <Page
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

  await transaction.settle;

  const store = transaction.stores[databaseMap.storeName];

  expect(store).toBeDefined();

  expect(store.put).toHaveBeenCalledTimes(1);
  expect(store.put).toHaveBeenCalledWith(newValue, databaseMap.key);
});

it("deletes the corresponding data from the database when submitted with the empty value", async () => {
  const { PageComponentWrapper } = jest.requireActual(
    "../helpers/PageComponentWrapper/PageComponentWrapper"
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

  const databaseMap = new DatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0
  });

  const emptyValue = "test empty value";

  const wrappers = [
    PageComponentWrapper.wrapDynamic(
      new DynamicPageComponent({
        key: "test-component",
        Component: TestDynamicComponent,
        props: {
          key: "test-key",
          content: "test content"
        },
        emptyValue,
        databaseMap
      })
    )
  ];

  const database = await Database.open("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <DatabaseProvider context={DBContext} allowUnmounting>
      <Page
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

  await transaction.settle;

  const store = transaction.stores[databaseMap.storeName];

  expect(store).toBeDefined();

  expect(store.delete).toHaveBeenCalledTimes(1);
  expect(store.delete).toHaveBeenCalledWith(databaseMap.key);
});
