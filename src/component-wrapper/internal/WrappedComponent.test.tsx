import React from "react";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestDynamicComponent } from "../../__fixtures__/components/TestDynamicComponent";

import { spyOnDatabaseGet } from "../../__tests__/helpers/spies";

import { Database } from "../../database/Database";
import { NamedSchema } from "../../database/types";
import { DatabaseContext } from "../../database-context/DatabaseContext";
import { DatabaseProvider } from "../../database-context/DatabaseProvider";

import { DatabaseMap } from "../DatabaseMap";
import { DynamicComponent } from "../DynamicComponent";

import { WrappedComponent } from "./WrappedComponent";

jest.mock("../../database/Database");

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

const testDatabaseMap = new DatabaseMap<TestSchema, "testStore">({
  storeName: "testStore",
  key: 0
});

const testComponent = new DynamicComponent({
  key: "test-component",
  Component: TestDynamicComponent,
  props: {
    content: "test content"
  },
  defaultValue: "test default",
  emptyValue: "test empty",
  databaseMap: testDatabaseMap
});

it("renders correctly with all non-context props", () => {
  const component = create(<WrappedComponent component={testComponent} />);

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={true}
        onChange={[Function]}
        value="test empty"
      />
    </div>
  `);
});

it("renders correctly without a default value for the component", () => {
  const dynamicComponent = new DynamicComponent({
    key: "test-component",
    Component: TestDynamicComponent,
    props: {
      content: "test content"
    },
    databaseMap: testDatabaseMap
  });

  const component = create(<WrappedComponent component={dynamicComponent} />);

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={true}
        onChange={[Function]}
        value=""
      />
    </div>
  `);
});

it("renders correctly with a database context", async () => {
  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <DBContext.Consumer>
        {(database): JSX.Element => (
          <WrappedComponent database={database} component={testComponent} />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={true}
        onChange={[Function]}
        value="test empty"
      />
    </div>
  `);

  await openPromise;
});

it("fetches the stored value specified by the `databaseMap` when a database provided by context finishes opening", async () => {
  const get = spyOnDatabaseGet();

  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider context={DBContext}>
        <DBContext.Consumer>
          {(database): JSX.Element => (
            <WrappedComponent database={database} component={testComponent} />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(get.spy).toHaveBeenCalledTimes(1);

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={false}
        onChange={[Function]}
        value="testStore/0"
      />
    </div>
  `);
});

it("uses the empty value before it fetches from the database", async () => {
  const get = spyOnDatabaseGet();

  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider context={DBContext}>
        <DBContext.Consumer>
          {(database): JSX.Element => (
            <WrappedComponent database={database} component={testComponent} />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
  });

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={false}
        onChange={[Function]}
        value="testStore/0"
      />
    </div>
  `);

  await get.settle;
});

it("uses the default value when fetching the stored value returns `undefined`", async () => {
  const get = spyOnDatabaseGet(false);

  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider context={DBContext}>
        <DBContext.Consumer>
          {(database): JSX.Element => (
            <WrappedComponent database={database} component={testComponent} />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={false}
        onChange={[Function]}
        value="test default"
      />
    </div>
  `);
});

it("uses the empty value when fetching the stored value returns `undefined` and there is no default value", async () => {
  const get = spyOnDatabaseGet(false);

  const dynamicComponent = new DynamicComponent({
    key: "test-component",
    Component: TestDynamicComponent,
    props: {
      content: "test content"
    },
    emptyValue: "test empty",
    databaseMap: testDatabaseMap
  });

  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider context={DBContext}>
        <DBContext.Consumer>
          {(database): JSX.Element => (
            <WrappedComponent
              database={database}
              component={dynamicComponent}
            />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(component).toMatchInlineSnapshot(`
    <div>
      <div>
        test content
      </div>
      <input
        data-testid="input"
        disabled={false}
        onChange={[Function]}
        value="test empty"
      />
    </div>
  `);
});

it("is disabled while the database is opening", async () => {
  const Tester = ({ disabled }: { disabled: boolean }): JSX.Element => (
    <div>{disabled ? "Is disabled" : "Is not disabled"}</div>
  );

  const dynamicComponent = new DynamicComponent({
    key: "test-component",
    Component: Tester,
    props: {},
    defaultValue: "test default",
    databaseMap: testDatabaseMap
  });

  const get = spyOnDatabaseGet();

  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <DBContext.Consumer>
        {(database): JSX.Element => (
          <WrappedComponent database={database} component={dynamicComponent} />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchInlineSnapshot(`
    <div>
      Is disabled
    </div>
  `);

  await openPromise;
  await get.settle;
});

it("is disabled while fetching the stored value from the database", async () => {
  const Tester = ({ disabled }: { disabled: boolean }): JSX.Element => (
    <div>{disabled ? "Is disabled" : "Is not disabled"}</div>
  );

  const dynamicComponent = new DynamicComponent({
    key: "test-component",
    Component: Tester,
    props: {},
    defaultValue: "test default",
    databaseMap: testDatabaseMap
  });

  const get = spyOnDatabaseGet();

  const database = await Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(database);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <DBContext.Consumer>
        {(database): JSX.Element => (
          <WrappedComponent database={database} component={dynamicComponent} />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchInlineSnapshot(`
    <div>
      Is disabled
    </div>
  `);

  await get.settle;
});
