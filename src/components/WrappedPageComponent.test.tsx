import React from "react";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestDynamicComponent } from "../__fixtures__/components/TestDynamicComponent";

import { spyOnDatabaseGet } from "../__tests__/helpers/spies";

import { DatabaseMap } from "../helpers/PageComponentWrapper/DatabaseMap";
import { DynamicPageComponent } from "../helpers/PageComponentWrapper/DynamicPageComponent";
import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { NamedSchema } from "../store/types";

import { DatabaseProvider } from "./DatabaseProvider";
import { WrappedPageComponent } from "./WrappedPageComponent";

jest.mock("../store/Database");

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

const testPageComponent = new DynamicPageComponent({
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
  const component = create(
    <WrappedPageComponent component={testPageComponent} />
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly without a default value for the component", () => {
  const pageComponent = new DynamicPageComponent({
    key: "test-component",
    Component: TestDynamicComponent,
    props: {
      content: "test content"
    },
    databaseMap: testDatabaseMap
  });

  const component = create(<WrappedPageComponent component={pageComponent} />);

  expect(component).toMatchSnapshot();
});

it("renders correctly with a database context", async () => {
  const openPromise = Database.open<TestSchema>("testDBName", 1);
  const DBContext = new DatabaseContext(openPromise);

  const component = create(
    <DatabaseProvider context={DBContext}>
      <DBContext.Consumer>
        {(database): JSX.Element => (
          <WrappedPageComponent
            database={database}
            component={testPageComponent}
          />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();

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
            <WrappedPageComponent
              database={database}
              component={testPageComponent}
            />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(get.spy).toHaveBeenCalledTimes(1);

  expect(component).toMatchSnapshot();
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
            <WrappedPageComponent
              database={database}
              component={testPageComponent}
            />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
  });

  expect(component).toMatchSnapshot();

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
            <WrappedPageComponent
              database={database}
              component={testPageComponent}
            />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(component).toMatchSnapshot();
});

it("uses the empty value when fetching the stored value returns `undefined` and there is no default value", async () => {
  const get = spyOnDatabaseGet(false);

  const pageComponent = new DynamicPageComponent({
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
            <WrappedPageComponent
              database={database}
              component={pageComponent}
            />
          )}
        </DBContext.Consumer>
      </DatabaseProvider>
    );

    await openPromise;
    await get.settle;
  });

  expect(component).toMatchSnapshot();
});

it("is disabled while the database is opening", async () => {
  const Tester = ({ disabled }: { disabled: boolean }): JSX.Element => (
    <div>{disabled ? "Is disabled" : "Is not disabled"}</div>
  );

  const pageComponent = new DynamicPageComponent({
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
          <WrappedPageComponent database={database} component={pageComponent} />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();

  await openPromise;
  await get.settle;
});

it("is disabled while fetching the stored value from the database", async () => {
  const Tester = ({ disabled }: { disabled: boolean }): JSX.Element => (
    <div>{disabled ? "Is disabled" : "Is not disabled"}</div>
  );

  const pageComponent = new DynamicPageComponent({
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
          <WrappedPageComponent database={database} component={pageComponent} />
        )}
      </DBContext.Consumer>
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();

  await get.settle;
});
