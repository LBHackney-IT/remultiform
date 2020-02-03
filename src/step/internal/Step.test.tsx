/* eslint-disable @typescript-eslint/no-empty-function */
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { act, create } from "react-test-renderer";

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
import { promiseToWaitForNextTick } from "../../__tests__/helpers/promise";

import { ComponentDatabaseMap } from "../../component-wrapper/ComponentDatabaseMap";
import { ComponentWrapper } from "../../component-wrapper/ComponentWrapper";
import { DynamicComponent } from "../../component-wrapper/DynamicComponent";
import { StaticComponent } from "../../component-wrapper/StaticComponent";
import { Database } from "../../database/Database";
import { NamedSchema } from "../../database/types";
import { DatabaseContext } from "../../database-context/DatabaseContext";
import { DatabaseProvider } from "../../database-context/DatabaseProvider";

import { Step } from "./Step";
import { Store } from "../../database/Store";
import { SubmitType } from "../Submit";

jest.mock("../../component-wrapper/ComponentWrapper");
jest.mock("../../database/Database");

it("renders correctly with all props", async () => {
  const database = await Database.open<DynamicFormSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <Step
      context={DBContext}
      componentWrappers={dynamicForm.steps[0].componentWrappers}
      submit={(): SubmitType => SimpleSubmit}
      afterSubmit={(): void => {}}
      nextSlug="/next"
      onNextSlugChange={(): void => {}}
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
    <Step componentWrappers={staticForm.steps[0].componentWrappers} />
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
    ]
  `);
});

it("calls next slug when it's a function", () => {
  const nextSlugFn = jest.fn();

  act(() => {
    create(
      <Step
        componentWrappers={dynamicForm.steps[0].componentWrappers}
        nextSlug={nextSlugFn}
      />
    );
  });

  expect(nextSlugFn).toHaveBeenCalledTimes(1);
  expect(nextSlugFn).toHaveBeenCalledWith({
    "test-dynamic-component": ""
  });
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
    ]
  `);
});

it("calls the after submit callback after submission", () => {
  const afterSubmit = jest.fn();

  const { getByTestId } = render(
    <Step
      componentWrappers={staticForm.steps[0].componentWrappers}
      submit={(): SubmitType => SimpleSubmit}
      afterSubmit={afterSubmit}
    />
  );

  fireEvent.click(getByTestId("submit"));

  expect(afterSubmit).toHaveBeenCalledTimes(1);
});

it("passes the next slug to the submit function", () => {
  let nextSlug: string | undefined = undefined;

  act(() => {
    create(
      <Step
        componentWrappers={staticForm.steps[0].componentWrappers}
        submit={(slug?: string): SubmitType => {
          nextSlug = slug;

          return SimpleSubmit;
        }}
        nextSlug="/next"
      />
    );
  });

  expect(nextSlug).toEqual("/next");
});

it("passes the result of the next slug callback to the submit function", () => {
  let nextSlug: string | undefined = undefined;

  act(() => {
    create(
      <Step
        componentWrappers={staticForm.steps[0].componentWrappers}
        submit={(slug?: string): SubmitType => {
          nextSlug = slug;

          return SimpleSubmit;
        }}
        nextSlug={(): string => "/next"}
      />
    );
  });

  expect(nextSlug).toEqual("/next");
});

it("calls the after submit callback after submission when it contains dynamic components", async () => {
  const afterSubmit = jest.fn();

  const database = await Database.open<DynamicFormSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const { getByTestId } = render(
    <Step
      context={DBContext}
      componentWrappers={dynamicForm.steps[0].componentWrappers}
      submit={(): SubmitType => SimpleSubmit}
      afterSubmit={afterSubmit}
      nextSlug="/next"
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
  const storePut = jest.spyOn(Store.prototype, "put");

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
        emptyValue: "test empty value",
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
        submit={(): SubmitType => SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;
  await promiseToWaitForNextTick();

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

  expect(storePut).toHaveBeenCalledTimes(1);
  expect(storePut).toHaveBeenCalledWith(databaseMap.key, newValue);
});

it("deletes the corresponding data from the database when submitted with the empty value", async () => {
  const { ComponentWrapper } = jest.requireActual(
    "../../component-wrapper/ComponentWrapper"
  );

  const get = spyOnDatabaseGet();
  const transaction = spyOnDatabaseTransaction();
  const storeDelete = jest.spyOn(Store.prototype, "delete");

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
        submit={(): SubmitType => SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;
  await promiseToWaitForNextTick();

  fireEvent.change(getByTestId("input"), { target: { value: emptyValue } });
  fireEvent.click(getByTestId("submit"));

  expect(transaction.spy).toHaveBeenCalledTimes(1);
  expect(transaction.spy).toHaveBeenCalledWith(
    ["testStore"],
    transaction.spy.mock.calls[0][1],
    "readwrite"
  );

  await transaction.settle;

  expect(storeDelete).toHaveBeenCalledTimes(1);
  expect(storeDelete).toHaveBeenCalledWith(databaseMap.key);
});

it("persists child property data to the database when submitted", async () => {
  const { ComponentWrapper } = jest.requireActual(
    "../../component-wrapper/ComponentWrapper"
  );

  const get = spyOnDatabaseGet(true, { a: { value: "old value" } });
  const transaction = spyOnDatabaseTransaction();
  const storePut = jest.spyOn(Store.prototype, "put");

  type TestSchema = NamedSchema<
    string,
    number,
    {
      testStore: {
        key: number;
        value: {
          a: { value: string };
        };
      };
    }
  >;

  const databaseMap = new ComponentDatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0,
    property: ["a", "value"]
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
        emptyValue: "test empty value",
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
        submit={(): SubmitType => SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;
  await promiseToWaitForNextTick();

  const newValue = "new value";

  fireEvent.change(getByTestId("input"), { target: { value: newValue } });
  fireEvent.click(getByTestId("submit"));

  expect(transaction.spy).toHaveBeenCalledTimes(1);

  await transaction.settle;

  expect(storePut).toHaveBeenCalledTimes(1);
  expect(storePut).toHaveBeenCalledWith(databaseMap.key, {
    a: { value: newValue }
  });
});

it("removes the corresponding child property data from the database when submitted with the empty value", async () => {
  const { ComponentWrapper } = jest.requireActual(
    "../../component-wrapper/ComponentWrapper"
  );

  const oldValue = { a: { value: "old value" } };

  const get = spyOnDatabaseGet(true, oldValue);
  const transaction = spyOnDatabaseTransaction();
  const storeGet = jest.spyOn(Store.prototype, "get");
  const storePut = jest.spyOn(Store.prototype, "put");

  storeGet.mockResolvedValue(oldValue);

  type TestSchema = NamedSchema<
    string,
    number,
    {
      testStore: {
        key: number;
        value: {
          a: { value: string };
        };
      };
    }
  >;

  const databaseMap = new ComponentDatabaseMap<TestSchema, "testStore">({
    storeName: "testStore",
    key: 0,
    property: ["a", "value"]
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
        submit={(): SubmitType => SimpleSubmit}
      />
    </DatabaseProvider>
  );

  await get.settle;
  await promiseToWaitForNextTick();

  fireEvent.change(getByTestId("input"), { target: { value: emptyValue } });
  fireEvent.click(getByTestId("submit"));

  expect(transaction.spy).toHaveBeenCalledTimes(1);

  await transaction.settle;

  expect(storePut).toHaveBeenCalledTimes(1);
  expect(storePut).toHaveBeenCalledWith(databaseMap.key, { a: {} });
});
