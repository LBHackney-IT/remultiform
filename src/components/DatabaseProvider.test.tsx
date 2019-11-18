import React from "react";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { TestDatabaseConsumer } from "../__fixtures__/components/TestDatabaseConsumer";

import {
  spyOnConsoleError,
  spyOnDatabaseOpen
} from "../__tests__/helpers/spies";

import { DatabaseContext } from "../helpers/DatabaseContext";

import { Database } from "../store/Database";
import { OpenOptions } from "../store/OpenOptions";
import { NamedSchema, Schema } from "../store/types";

import { DatabaseProvider } from "./DatabaseProvider";
import { TestErrorBoundary } from "../__fixtures__/components/TestErrorBoundary";

const DBContext = new DatabaseContext();

let databseOpenSpy: jest.SpyInstance<
  Promise<Database<NamedSchema<string, Schema>>>,
  [string, number?, OpenOptions<Schema>?]
>;

beforeEach(() => {
  databseOpenSpy = spyOnDatabaseOpen();
});

it("renders correctly with a resolved database", async () => {
  const database = await Database.open("testDBName");

  const component = create(
    <DatabaseProvider context={DBContext} openDatabaseOrPromise={database}>
      <TestDatabaseConsumer context={DBContext} />
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly before the database resolves", () => {
  const databasePromise = Database.open("testDBName");

  const component = create(
    <DatabaseProvider
      context={DBContext}
      openDatabaseOrPromise={databasePromise}
    >
      <TestDatabaseConsumer context={DBContext} />
    </DatabaseProvider>
  );

  expect(component).toMatchSnapshot();
});

it("renders correctly after the database resolves", async () => {
  const databasePromise = Database.open("testDBName");

  let component: ReactTestRenderer | undefined = undefined;

  await act(async () => {
    component = create(
      <DatabaseProvider
        context={DBContext}
        openDatabaseOrPromise={databasePromise}
      >
        <TestDatabaseConsumer context={DBContext} />
      </DatabaseProvider>
    );

    await databasePromise;
  });

  expect(component).toMatchSnapshot();
});

it("throws if the database rejects", async () => {
  let resolveInternalDatabasePromise: () => void;

  const internalDatabasePromise = new Promise(resolve => {
    resolveInternalDatabasePromise = resolve;
  });

  databseOpenSpy.mockImplementation(async () => {
    await internalDatabasePromise;

    throw new Error("test error");
  });

  const databasePromise = Database.open("testDBName");

  let component: ReactTestRenderer | undefined = undefined;

  const consoleErrorSpy = spyOnConsoleError();

  await act(async () => {
    component = create(
      <TestErrorBoundary>
        <DatabaseProvider
          context={DBContext}
          openDatabaseOrPromise={databasePromise}
        >
          <TestDatabaseConsumer context={DBContext} />
        </DatabaseProvider>
      </TestErrorBoundary>
    );

    resolveInternalDatabasePromise();

    await internalDatabasePromise;
  });

  expect(consoleErrorSpy.mock.calls).toMatchSnapshot();

  consoleErrorSpy.mockRestore();

  expect(component).toMatchSnapshot();
});
